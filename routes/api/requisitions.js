const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const Requisition = require('../../models/RequisitionModel');
const Department = require('../../models/DepartmentModel');
const { check, validationResult } = require('express-validator');
const { query } = require('express');

// @Route   Get api/request
// @desc    Fetch all request by user/creator
// @Access  Private
router.get('/', auth, async (req, res) => {
  let queryParams = {},
    cloneQueryParams;
  let directQueryParams = {};
  const reqQuery = req.query;
  directQueryParams.directRequest = false;

  if (reqQuery) {
    queryParams = reqQuery;
  }
  queryParams.departmentalId;

  let role = req.query?.role || req.user.role[0];
  switch (role) {
    case 'user':
      queryParams.user = req.user.id;
      cloneQueryParams = queryParams;
      break;

    case 'verifier':
      queryParams.departmentalId = req.user.departmentId;
      queryParams['inputter.status'] = true;
      cloneQueryParams = queryParams;
      break;

    case 'acc_checker':
      queryParams['approve.status'] = true;
      cloneQueryParams = queryParams;
      break;

    case 'authorizer':
      queryParams['inputter.status'] = true;
      queryParams['verify.status'] = true;
      if (req.user.departmentId === '61bc653dc0c5770d6f802613') {
        queryParams['ITRelated'] = true;
      } else {
        queryParams['ITRelated'] = false;
      }
      cloneQueryParams = queryParams;
      break;

    case 'approver':
      queryParams['inputter.status'] = true;
      queryParams['verify.status'] = true;
      queryParams['authorize.status'] = true;
      directQueryParams.directRequest = true;
      directQueryParams['inputter.status'] = true;
      directQueryParams['verify.status'] = true;
      if (req.query.departmentalId)
        directQueryParams['departmentalId'] = req.query.departmentalId;
      cloneQueryParams = {
        $or: [directQueryParams, queryParams],
      };
      break;

    default:
      return res.status(401).json({ msg: 'user not authorized' });
  }
  try {
    const requests = await Requisition.find(cloneQueryParams)
      .sort({ date: -1 })
      .populate({
        path: 'verify',
        populate: {
          path: 'verifier',
          select: 'name',
        },
      })
      .populate('user', 'name')
      .populate('departmentalId', 'name');
    res.json(requests);
  } catch (error) {
    console.log(error);
    res.status(500).send('server down');
  }
});

// @Route   get api/request
// @desc    fetch request by requestID by authorizer and all
// @Access  Private
router.get('/:id', auth, async (req, res) => {
  const requestId = req.params.id;
  try {
    const result = await Requisition.findById(requestId)
      .populate('user', ['departmentId', 'name', 'email'])
      .populate({
        path: 'verify',
        populate: {
          path: 'verifier',
          select: 'name',
        },
      })
      .populate({
        path: 'authorize',
        populate: {
          path: 'authorizer',
          select: 'name',
        },
      })
      .populate({
        path: 'approve',
        populate: {
          path: 'approver',
          select: 'name',
        },
      })
      .populate({
        path: 'comments',
        populate: {
          path: 'userId',
          select: 'name',
        },
      });
    if (!result) {
      return res
        .status(401)
        .json({ msg: "request with that Id can't be found" });
    }
    res.json(result);
  } catch (error) {
    console.log(error);
    res.status(500).send('server down');
  }
});

// @Route   Post api/request
// @desc    Create or Update request by Creator
// @Access  Private
router.post(
  '/',
  [
    check('itemName', 'Item can not be empty').not().isEmpty(),
    check('ITRelated', 'Item type can not be empty').not().isEmpty(),
    check('vendor', 'Vendor can not be empty').not().isEmpty(),
    check('quantity', 'quantity can not be empty').not().isEmpty(),
    check('departmentalId', 'Department can not be empty').not().isEmpty(),
  ],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    const {
      itemName,
      unitPrice,
      totalPrice,
      ITRelated,
      discount,
      quantity,
      vendor,
      directRequest,
      departmentalId,
      note,
      imgUrl,
      status,
    } = req.body;
    const { requestId } = req.query;

    try {
      // for updating Requisition by User
      // check if the requisition is valid
      if (requestId) {
        const requestResult = await Requisition.findById(requestId);
        if (!requestResult) {
          return res.status(401).json({ msg: "Requisition can't be found" });
        }

        // set new Update object
        let update = {};
        update.itemName = itemName;
        update.unitPrice = unitPrice;
        update.discount = discount;
        update.totalPrice = totalPrice;
        update.ITRelated = ITRelated;
        update.quantity = quantity;
        update.vendor = vendor;
        update.directRequest = directRequest;
        update.imgUrl = imgUrl;
        if (note && note.localeCompare(requestResult.note?.value !== 0)) {
          update.note = {};
          let comment = { value: note, userId: req.user.id };
          if (req.user.id === requestResult.user) {
            update.isEdited = false;
          } else {
            update.isEdited = true;
          }

          const updatedRequest = await Requisition.findByIdAndUpdate(
            requestId,
            {
              $set: update,
              $push: { comments: comment },
            },
            {
              new: true,
            }
          ).populate('user', 'name');
          return res.json(updatedRequest);
        }
        const updatedRequest = await Requisition.findByIdAndUpdate(
          requestId,
          update,
          {
            new: true,
          }
        ).populate('user', 'name');
        return res.json(updatedRequest);
      }
      // For new Requisition
      let request = new Requisition({
        user: req.user.id,
        itemName,
        unitPrice,
        discount,
        totalPrice,
        ITRelated,
        quantity,
        imgUrl,
        vendor,
        directRequest,
        departmentalId,
        comments: [
          {
            value: note,
            userId: req.user.id,
          },
        ],
      });
      let result = await request.save();
      result = await Requisition.findById(result._id).populate('user', 'name') 
      return res.json(result);
    } catch (error) {
      console.log(error);
      res.status(500).send('server down');
    }
  }
);

// @Route   put api/request BY others roles aside user
// @desc    Update request by requestID
// @Access  Private
router.put('/:id', auth, async (req, res) => {
  const requestId = req.params.id;
  const { status } = req.body;
  const user = req.user;
  try {
    const requestResult = await Requisition.findById(requestId);
    if (!requestResult) {
      return res.status(401).json({ msg: "Requisition can't be found" });
    }
    // set the update field
    const update = {};
    update.isEdited = false;
    switch (req.query.role || user.role[0]) {
      case 'user':
        update.inputter = {};
        update.inputter.status = status;
        break;

      case 'verifier':
        update.verify = {};
        update.verify.status = status;
        update.verify.verifier = user.id;
        break;

      case 'acc_checker':
        update.acc_check = {};
        update.acc_check.status = status;
        update.acc_check.acc_checker = user.id;
        break;

      case 'authorizer':
        update.authorize = {};
        update.authorize.status = status;
        update.authorize.authorizer = user.id;
        break;

      case 'approver':
        update.approve = {};
        update.approve.status = status;
        update.approve.approver = user.id;
        break;

      default:
        return res.status(401).json({ msg: 'user not authorized' });
    }
    // update requisition and save
    const updatedRequest = await Requisition.findByIdAndUpdate(
      requestId,
      update,
      {
        new: true,
      }
    ).populate('user', 'name');
    return res.json(updatedRequest);
  } catch (error) {
    console.log(error);
    res.status(500).send('server down');
  }
});
module.exports = router;
