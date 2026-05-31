const cells = document.querySelectorAll(".cell");
console.log("Found cells:", cells.length);
cells.forEach(cell => {
    cell.addEventListener("click", () => {
        console.log("Cell clicked, toggling active");
        cell.classList.toggle("active");
    });
});
export {};
//# sourceMappingURL=index.js.map