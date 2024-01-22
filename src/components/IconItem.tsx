function IconItem(path: string) {
  return <div className="p-1 border rounded shadow-md shadow-black">
    <img src={path} className="h-6 w-6"></img>
  </div>;
}

export default IconItem;
