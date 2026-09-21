const TeamCard = ({ mahasiswa }) => {
  const displayed = mahasiswa.slice(0, 10);

  return (
    <div className="w-full grid grid-cols-5 gap-3 px-1">
      {displayed.map((member) => (
        <div key={member.id} className="flex flex-col items-center gap-1 min-w-0">
          <div
            className="w-14 h-14 rounded-full bg-gray-300 bg-cover bg-center border-2 border-white shadow-md flex-shrink-0"
            style={{ backgroundImage: `url(${member.image})` }}
          />
          <p className="text-[11px] font-semibold text-center w-full truncate leading-tight px-0.5">
            {member.name.split(" ")[0]}
          </p>
        </div>
      ))}
    </div>
  );
};

export default TeamCard;
