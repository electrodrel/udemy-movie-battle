const createAutoComplete = ({root, renderOption, onOptionSelect, inputValue, fetchData}) => {
  root.innerHTML = `
    <label><b>Search for movie</b></label>
    <input class="input"/>
    <div class="dropdown">
        <div class="dropdown-menu">
            <div class="dropdown-content results">      
            </div>
        </div>
    </div>
`;

  const input = root.querySelector("input");
  const dropdown = root.querySelector(".dropdown");
  const resultWrapper = root.querySelector(".results");

  document.addEventListener("click", (event) => {
    if (!root.contains(event.target)) {
      dropdown.classList.remove("is-active");
    }
  });

  input.addEventListener(
    "input",
    debounce(async (event) => {
      const items = await fetchData(event.target.value);
      resultWrapper.innerHTML = "";
      if (items.length > 0) {
        dropdown.classList.add("is-active");
      } else {
        dropdown.classList.remove("is-active");
      }

      for (let item of items) {
        const option = document.createElement("a");
        option.innerHTML = renderOption(item);
        option.classList.add("dropdown-item");        
        option.addEventListener("click", async () => {
            dropdown.classList.remove("is-active");
            input.value = inputValue(item);
            await onOptionSelect(item);
        });
        resultWrapper.appendChild(option);
      }
    })
  );
};
