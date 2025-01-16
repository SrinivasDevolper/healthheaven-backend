const addDoctors = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      specialty,
      degree,
      experience,
      about,
      fees,
      address,
    } = req.body;
    res.status(200).json({
      userData: {
        name,
        email,
        password,
        specialty,
        degree,
        experience,
        about,
        fees,
        address,
      },
    });
  } catch (error) {
    res.status(500).json({
      error: "An error occurred while adding the doctor!",
      details: error.message,
    });
  }
};

module.exports = addDoctors;
