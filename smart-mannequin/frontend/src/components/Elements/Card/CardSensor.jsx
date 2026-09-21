import BaseCard from ".";

const CardSensor = ({ title }) => {
  // TODO : props row, col untuk menentukan layout
  //

  return (
    <BaseCard>
      <div className="flex flex-col gap-5">
        {title && (
          <h2 className="font-bold self-end text-2xl">
            {title}
          </h2>
        )}
        <p>125</p>
        <p>stat</p>
      </div>
    </BaseCard>
  );
};

export default CardSensor;
