import React, { useState, useEffect } from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import { Heart } from "lucide-react";
import { useTranslation } from "react-i18next";

const HighHeartRateDialog = ({ isOpen, onClose }) => {
  const { t } = useTranslation();
  return (
    <Dialog open={isOpen} onClose={onClose}>
      <DialogTitle className="flex items-center text-red-600 animate-pulse">
        <Heart className="w-6 h-6 mr-2" />
        {t("HighHeart")}
      </DialogTitle>
      <DialogContent>
        <DialogContentText>
          <p className="mb-2 font-semibold">
            {t("Please take the following precautions")}
          </p>
          <ol className="list-decimal list-inside mb-4">
            <li>{t("listPrecautions.1")}</li>
            <li>{t("listPrecautions.2")}</li>
            <li>{t("listPrecautions.3")}</li>
            <li>{t("listPrecautions.4")}</li>
          </ol>
        </DialogContentText>
        <Button
          onClick={onClose}
          color="primary"
          variant="contained"
          className="mt-8">
          {t("Acknowledge")}
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default HighHeartRateDialog;
