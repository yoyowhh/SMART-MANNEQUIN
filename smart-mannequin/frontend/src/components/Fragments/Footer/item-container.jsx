import ItemList from "./itemlist";

const ItemContainer = ({ title, listItems }) => {
  return (
    <div>
      <p className="font-medium text-gray-900">{title}</p>

      <ul className="mt-6 space-y-4 text-sm">
        {listItems.map((item, index) => (
          <ItemList key={index} href="#">
            {item}
          </ItemList>
        ))}
      </ul>
    </div>
  );
};

export default ItemContainer;
