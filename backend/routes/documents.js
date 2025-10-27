const express = require('express');
const router = express.Router();
const {
  getDocuments,
  getDocument,
  createDocument,
  updateDocument,
  deleteDocument,
  archiveDocument,
  restoreDocument,
  addNote,
  getStatistics,
  downloadFile
} = require('../controllers/documentController');
const { protect, authorize, checkPermission } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Protect all routes
router.use(protect);

// Statistics route
router.get('/stats/overview', getStatistics);

// Main routes
router.route('/')
  .get(getDocuments)
  .post(
    checkPermission('create'),
    upload.array('scannedImages', 10),
    createDocument
  );

router.route('/:id')
  .get(getDocument)
  .put(
    checkPermission('update'),
    upload.array('scannedImages', 10),
    updateDocument
  )
  .delete(authorize('admin'), deleteDocument);

// Archive routes
router.put('/:id/archive', checkPermission('archive'), archiveDocument);
router.put('/:id/restore', checkPermission('archive'), restoreDocument);

// Notes route
router.post('/:id/notes', addNote);

// Download route
router.get('/:id/download/:fileId', downloadFile);

module.exports = router;
