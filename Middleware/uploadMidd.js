import multer from "multer";

// Configure storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, 'public/images/');
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}_${file.originalname}`);
    },
  });


  const upload = multer({ storage, limits: { fileSize: 5 * 1024 * 1024 } });
  // const upload = multer({ storage: multer.memoryStorage() });

  export {upload};