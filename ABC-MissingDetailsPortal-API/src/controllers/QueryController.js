/**
 * Controller for queries endpoints
 */
const _ = require('lodash')
const json2xls = require('json2xls')
const service = require('../services/QueryService')
const csvStringify = require('csv-stringify/lib/sync')

/**
 * Search queries
 * @param req the request
 * @param res the response
 */
function * search (req, res) {
  if (req.headers.accept === 'application/xls' || req.headers.accept === 'text/csv') {
    req.query.viewType = 'Expanded'
  }
  const searchResult = yield service.search(req.query, req.user)

  if (req.headers.accept !== 'application/xls' && req.headers.accept !== 'text/csv') {
    return res.send(searchResult)
  }

  const data = [['ID', 'Exception Type', 'Exception Sub Type', 'Country', 'Account Name',
    'AMP ID', 'Billing Index', 'Billing Start Date', 'Billing End Date', 'SAP Contract', 'Value to be Billed',
    'Currency', 'SDM Email', 'Requestor Email', 'Due Date', 'Revise Date', 'Opened Date', 'Closed Date', 'Rework',
    'Rework Reason', 'DMPS/PMPS', 'Status', 'Comment', 'Updated On', 'Priority', 'Attachments']]
  _.each(searchResult.results, (q) => {
    data.push([q.id, (q.exceptionType && q.exceptionType.name) || '', q.exceptionSubType,
      (q.country && q.country.name) || '', q.accountName, q.ampId, q.billingIndex, q.billingStartDate,
      q.billingEndDate, q.sapContract, q.valueToBeBilled, (q.currency && q.currency.name) || '',
      (q.sdm && q.sdm.email) || '', (q.requestor && q.requestor.email) || '', q.dueDate, q.reviseDate,
      q.openedDate, q.closedDate, q.rework, q.reworkReason, q.dmpsPmps, q.status, q.comment, q.updatedOn, q.priority,
      _.map(q.attachments || [], 'fileURL').join(', ')])
  })

  if (req.headers.accept === 'text/csv') {
    res.attachment('queries.csv')
    res.send(csvStringify(data))
  } else {
    // convert rows data to queries objects
    const queries = []
    for (let i = 1; i < data.length; i += 1) {
      const q = {}
      for (let j = 0; j < data[0].length; j += 1) {
        q[data[0][j]] = data[i][j]
      }
      queries.push(q)
    }
    res.attachment('queries.xlsx')
    res.end(json2xls(queries), 'binary')
  }
}

/**
 * Create a new query
 * @param req the request
 * @param res the response
 */
function * create (req, res) {
  req.body.requestorId = req.user.id
  res.send(yield service.create(req.body))
}

/**
 * Get query by id
 * @param req the request
 * @param res the response
 */
function * get (req, res) {
  res.send(yield service.get(req.params.id))
}

/**
 * Update query
 * @param req the request
 * @param res the response
 */
function * update (req, res) {
  res.send(yield service.update(req.params.id, req.body))
}

/**
 * Update query partially, only passed attributes will be updated
 * @param req the request
 * @param res the response
 */
function * updatePartially (req, res) {
  res.send(yield service.updatePartially(req.params.id, req.body))
}

/**
 * Reassign queries
 * @param req the request
 * @param res the response
 */
function * reassign (req, res) {
  yield service.reassign(req.body)
  res.status(204).end()
}

/**
 * Import queries
 * @param req the request
 * @param res the response
 */
function * importQueries (req, res) {
  res.send(yield service.importQueries(req.file, req.user))
}

/**
 * Watch query
 * @param req the request
 * @param res the response
 */
function * watch (req, res) {
  yield service.watch(req.params.id, req.user.id)
  res.status(204).end()
}

/**
 * Unwatch query
 * @param req the request
 * @param res the response
 */
function * unwatch (req, res) {
  yield service.unwatch(req.params.id, req.user.id)
  res.status(204).end()
}

/**
 * Get watchers of query
 * @param req the request
 * @param res the response
 */
function * getWatchers (req, res) {
  res.send(yield service.getWatchers(req.params.id))
}

/**
 * Update watchers of query
 * @param req the request
 * @param res the response
 */
function * updateWatchers (req, res) {
  yield service.updateWatchers(req.params.id, req.body)
  res.status(204).end()
}

/**
 * Get SDM comment of query
 * @param req the request
 * @param res the response
 */
function * getSDMCommentOfQuery (req, res) {
  res.send(yield service.getSDMCommentOfQuery(req.params.id))
}

/**
 * Create SDM comment
 * @param req the request
 * @param res the response
 */
function * createSDMComment (req, res) {
  res.send(yield service.createSDMComment(req.body, req.user.id))
}

/**
 * Get SDM comment by id
 * @param req the request
 * @param res the response
 */
function * getSDMComment (req, res) {
  res.send(yield service.getSDMComment(req.params.id))
}

module.exports = {
  search,
  create,
  get,
  update,
  updatePartially,
  reassign,
  importQueries,
  watch,
  unwatch,
  getWatchers,
  updateWatchers,
  getSDMCommentOfQuery,
  createSDMComment,
  getSDMComment
}
