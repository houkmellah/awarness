const Fear = require("../models/fear");

const createFear = async (req, res) => {
  const { title, description, createdBy } = req.body;
  console.log("Req Body =======>", req.body);
  const newfear = new Fear({
    title,
    description,
    createdBy,
  });
  await newfear.save();
  res.status(201).json(newfear);
};

const getFears = async (req, res) => {
  const fears = await Fear.find();
  res.status(200).json(fears);
};

const updateFear = async (req, res) => {
  const { id } = req.params;
  const { title, description } = req.body;
  const updatedfear = await Fear.findByIdAndUpdate(
    id,
    {
      title,
      description,
      updatedAt: Date.now(),
    },
    { new: true }
  );
  res.status(200).json(updatedfear);
};

const deleteFear = async (req, res) => {
  const { id } = req.params;
  await Fear.findByIdAndDelete(id);
  res.status(204).send();
};

const getFearsByUser = async (req, res) => {
  const fears = await Fear.find({ createdBy: req.userId });
  res.status(200).json(fears);
};

module.exports = {
  createFear,
  getFears,
  updateFear,
  deleteFear,
  getFearsByUser,
};
