const ItemList = ({ href, children }) => (
  <li>
    <a href={href} className="text-gray-700 transition hover:opacity-75">
      {children}
    </a>
  </li>
);

export default ItemList;
