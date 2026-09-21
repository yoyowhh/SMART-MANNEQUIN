import * as React from "react";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Fade from "@mui/material/Fade";
import Typography from "@mui/material/Typography";
import { CardMember } from "../Card/CardMember";
import { useTranslation } from "react-i18next";

// Function to determine if the screen width is less than 600px
const isMobile = () => window.matchMedia("(max-width: 600px)").matches;

// Function to determine if the screen width is less than or equal to 1280px
const isTablet = () => window.matchMedia("(max-width: 1280px)").matches;

// Function to determine if the screen width is less than or equal to 1920px
const isLaptop = () => window.matchMedia("(max-width: 1920px)").matches;

const getModalStyle = () => {
  if (isMobile()) {
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "80%",
      bgcolor: "background.paper",
      border: "2px solid #000",
      borderRadius: 4,
      boxShadow: 24,
      p: 4,
    };
  } else if (isTablet()) {
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "70%", // Adjusted width for tablet
      bgcolor: "background.paper",
      border: "2px solid #000",
      borderRadius: 4,
      boxShadow: 24,
      p: 4,
    };
  } else if (isLaptop()) {
    return {
      position: "absolute",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "65%", // Adjusted width for laptop
      bgcolor: "background.paper",
      border: "2px solid #000",
      borderRadius: 4,
      boxShadow: 24,
      p: 4,
    };
  } else {
    return {
      position: "absolute",
      top: "100%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "50%", // Default width
      bgcolor: "background.paper",
      border: "2px solid #000",
      borderRadius: 4,
      boxShadow: 24,
      p: 4,
    };
  }
};
export default function TransitionsModal({ mahasiswa }) {
  const { t } = useTranslation();
  const [open, setOpen] = React.useState(false);
  const [modalStyle, setModalStyle] = React.useState(getModalStyle());
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const listDosen = [
    {
      id: 1,
      name: "Giva Andriana Mutiara, S.T., M.T., Ph.D.",
      role: "Ketua STAS - RG",
      image: "/images/stas-rg/anggota/buGiva.jpg",
    },
    {
      id: 2,
      name: "Muhammad Rizqy Alfarisi, S.ST., M.T.",
      role: "Dosen Pembimbing",
      image: "/images/stas-rg/anggota/pakAlfa.jpg",
    },
    {
      id: 3,
      name: "Periyadi, S.T., M.T.",
      role: "Dosen Pembimbing",
      image: "/images/stas-rg/anggota/Periyadi.jpg",
    },
    {
      id: 4,
      name: "Lisda Meisaroh, S.Si., M.Si.",
      role: "Dosen Pembimbing",
      image: "/images/stas-rg/anggota/Lisda.jpg",
    },
  ];

  React.useEffect(() => {
    const handleResize = () => {
      setModalStyle(getModalStyle());
    };

    window.addEventListener("resize", handleResize);

    // Cleanup the event listener on component unmount
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div>
      <button
        onClick={handleOpen}
        className="p-2 rounded-lg font-bold text-green-500 ">
        {t("showMore")}
      </button>
      <Modal
        aria-labelledby="transition-modal-title"
        aria-describedby="transition-modal-description"
        open={open}
        onClose={handleClose}
        closeAfterTransition
        slots={{ backdrop: Backdrop }}
        slotProps={{
          backdrop: {
            timeout: 500,
          },
        }}>
        <Fade in={open}>
          {/* Close Button */}

          <Box
            sx={{
              ...modalStyle,
              overflowY: isMobile() ? "auto" : "visible", // Enable scrolling on mobile
              maxHeight: isMobile() ? "calc(100vh - 100px)" : "auto", // Set a max height on mobile
            }}>
            <button
              onClick={handleClose}
              className="w-8 h-8 sm:w-10  bg-slate-300 rounded-full text-sm top-2 right-3 sm:top-4 sm:rigt-10 font-bold text-black absolute">
              X
            </button>
            <p className="text-xl font-bold ">Honorable Member of STAS - RG</p>
            <Typography
              id="transition-modal-description"
              sx={{ mt: 2 }}></Typography>

            {/* Section 1 */}
            <p className="text-lg font-semibold mb-2">Dosen Pembimbing</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4  ">
              {listDosen.map((dosen) => (
                <CardMember
                  key={dosen.id}
                  image={dosen.image}
                  name={dosen.name}
                  role={dosen.role}
                />
              ))}
            </div>
            {/* End of Section 1 */}
            <hr className="mt-5 mb-5 border-2" />
            {/* Section 2 */}
            <p className="text-lg font-semibold mb-2">Mahasiswa</p>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3  ">
              {mahasiswa.map((mahasiswa) => (
                <CardMember
                  key={mahasiswa.id}
                  image={mahasiswa.image}
                  name={mahasiswa.name}
                  role={mahasiswa.role}
                />
              ))}
            </div>
            {/* End of Section 2 */}
          </Box>
        </Fade>
      </Modal>
    </div>
  );
}
