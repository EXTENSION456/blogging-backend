import multer from "multer";

const ramStorage = multer.memoryStorage();

export const upload = multer({
  storage: ramStorage,
});
