"use strict";

const Mannequin = require("../../model/mannequin/mannequinModel");

exports.index = async (req, res) => {
  try {
    const data = await Mannequin.index();
    res.json(data);
  } catch (err) {
    res.status(500).send({
      status: "failed",
      message:
        err?.message || "Some error occurred while retrieving mannequin.",
    });
  }
};

exports.show = async (req, res) => {
  try {
    const data = await Mannequin.show(req.params.id);
    res.json(data);
  } catch (err) {
    if (err.kind === "not_found") {
      res.status(404).send({
        status: "failed",
        message: `Not found Mannequin with id ${req.params.id}.`,
      });
    } else {
      res.status(500).send({
        status: "failed",
        message: `Error retrieving Mannequin with id ${req.params.id}.`,
      });
    }
  }
};
