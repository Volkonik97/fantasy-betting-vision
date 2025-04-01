
// Re-export all image utility functions from the new modular structure
// This maintains backward compatibility with existing code that imports from this file
export { 
  verifyImageExists,
  clearInvalidImageReference,
  clearAllPlayerImageReferences,
  refreshImageReferences,
  checkBucketRlsPermission
} from './images';
