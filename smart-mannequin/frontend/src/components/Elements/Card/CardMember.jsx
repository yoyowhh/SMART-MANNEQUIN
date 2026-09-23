export const CardMember = ({ image, name, role }) => {
  return (
    <div className="bg-gray-200 w-64 sm:w-full h-22 flex p-4 justify-start items-center gap-4 shadow-md rounded-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-emerald-300">
      <div
        className="w-10 h-10 sm:w-12 sm:h-12 bg-gray-400 rounded-full bg-cover bg-center"
        style={{ backgroundImage: `url(${image})` }}
        alt="gweh bngt"></div>
      <div className="flex flex-col gap-2 justify-center">
        <p className="text-sm font-semibold">{name}</p>
        <p className="text-sm text-gray-500">{role}</p>
      </div>
    </div>
  );
};
