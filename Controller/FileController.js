const uploadFiles = async (req, res) => {
  try {
    const files = req.files;
    if (!files ) {
      return res.status(400).json({ message: 'No files uploaded' });
    }
    console.log(files);

    res.status(201).json({ message: 'Files uploaded successfully', });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

export{ uploadFiles };