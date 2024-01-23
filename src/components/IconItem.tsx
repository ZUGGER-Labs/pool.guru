function IconItem(path: string, link: string) {
  return <div className="p-1 bg-white rounded shadow-md shadow-black" >
    <a href={link} target="_blank" rel="noopener noreferrer">
    <img src={path} className="h-6 w-6"></img>
    </a>
  </div>;
}

export default IconItem;
