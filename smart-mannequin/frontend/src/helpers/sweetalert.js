import Swal from "sweetalert2";

// General showAlert function
export const showAlert = async (options) => {
  try {
    const result = await Swal.fire(options);
    return result;
  } catch (error) {
    console.error("Error showing alert", error);
  }
};

// Success Alert
export const showSuccess = (message) => {
  return showAlert({
    title: "Success!",
    // text: message ?? "",
    html: message?.replace(/\n/g, "<br>") ?? "",
    icon: "success",
    confirmButtonText: "OK",
    confirmButtonColor: "#3085d6",
    timer: 3000,
    timerProgressBar: true,
  });
};

// Error Alert
export const showError = (message) => {
  return showAlert({
    title: "Error!",
    text: message ?? "",
    icon: "error",
    confirmButtonText: "Try Again",
    confirmButtonColor: "#3085d6",
    timer: 3000,
    timerProgressBar: true,
  });
};

// Confirmation Alert
export const showConfirmation = async (message) => {
  const result = await showAlert({
    title: "Are you sure?",
    text: message ?? "",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, do it!",
    cancelButtonText: "No, cancel!",
    confirmButtonColor: "#3085d6",
    cancelButtonColor: "#d33",
  });
  return result.isConfirmed;
};
