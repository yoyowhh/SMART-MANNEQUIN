const PageNotFound = () => {
  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <h2 className="text-5xl font-bold">404</h2>
      <h2 className="text-xl">Page Not Found</h2>
      <a href="/" className="text-blue-600 cursor-pointer hover:underline pt-6">Back To Homepage</a>
    </div>
  );
};

export default PageNotFound;