function LinkItem(title: string, link: string) {
    return (
        <a href={link} target="_blank" rel="noopener noreferrer"
        className="text-base font-bold">
        {title}
        </a>
    )
}

export default LinkItem