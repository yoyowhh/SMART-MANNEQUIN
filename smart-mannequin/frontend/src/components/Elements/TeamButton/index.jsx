const TeamButton = ({ onClick, title, subtitle, width }) => {
  return (
    <div className={`${width} flex rounded text-center justify-center items-center`}>
      <button
        onClick={onClick}
        className="flex w-[200px] text-white bg-green-700 text-center h-full px-auto rounded-3xl justify-center items-center"
      >
        <div className="font-mono">
          {title}
          <br />
          {subtitle}
        </div>
      </button>
    </div>
  );
};
export default TeamButton;
