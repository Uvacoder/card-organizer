// constants for default settings if keyword arguments are not defined
const UNIQUE_DEFAULT_SETTING = true;
const MUTATION_DEFAULT_SETTING = true;
const HIDDEN_DATA_DEFAULT_SETTING = true;

/**
 * A class that allows a user to create a number of elements to manipulate cards.
 */
class CardOrganizer {
    /**
     * Create a CardOrganizer object.
     * @param {Object[]} data 
     * @param {Element} cardContainerEl
     * @param {Element} outputEl 
     * @param {Object} config
     */
    constructor(data, cardContainerEl, outputEl, config)
    {
        // ensure that all positional arguments are defined before proceeding
        if (!data || !cardContainerEl || !outputEl)
        {
            return;
        }

        // populate the configuration settings
        this.keysAreUnique = config?.unique || UNIQUE_DEFAULT_SETTING;
        this.allowMutatation = config?.mutation || MUTATION_DEFAULT_SETTING;
        this.hiddenData = config?.hiddenData || HIDDEN_DATA_DEFAULT_SETTING;

        // an array to keep track of the key order of the cards
        this.keys = [];

        // populate keys array and check for key uniqueness
        data
            .forEach(item => {
                // ensure key uniqueness by throwing error and stop checking if the key is already array
                if (this.keysAreUnique && this.keys.includes(item.key))
                {
                    throw new Error("Block keys must be unique.");
                }

                this.keys.push(item.key);
            });

        // set the output element value to inital key order
        outputEl.value = this.keys.join(",");

        // enable drop detection of cards
        outputEl.ondragover = e => e.preventDefault();
        outputEl.ondrop = e => e.preventDefault();

        data
            .forEach(item => {
                    // create a card HTML element object so that we can easily manage drag-n-drop functionality
                    const card = document.createElement("div");
                    card.className = "card";
                    card.draggable = true;
                    card.setAttribute("data-key", item.key);

                    // set the card contents to Bootstrap card markup with its data
                    card.innerHTML = `
                        <div class="card-body">
                            <h5 class="card-title">
                                ${item.title}
                            </h5>
                            
                            <p class="card-text">
                                ${item.description}
                            </p>
                        </div>
                    `;

                    // add a class to items being currently dragged so they can be identified with querySelector
                    card.ondragstart = () => card.classList.add("dragging");
                    card.ondragend   = () => card.classList.remove("dragging");

                    // when the user stops dragging, swap the element
                    cardContainerEl.ondragover = e => {
                        e.preventDefault();

                        const currentElement = document.querySelector(".dragging");
                        const nextSibling = getDragAfterElement(cardContainerEl, e.clientY);

                        // if no next sibling, insert at end
                        if (nextSibling == null) 
                        {
                            cardContainerEl.appendChild(currentElement);
                        }
                        // if next sibling, insert before next sibling
                        else 
                        {
                            cardContainerEl.insertBefore(currentElement, nextSibling);
                        }

                        // get updated key order and update the output element value
                        this.keys = [...cardContainerEl.children].map(x => parseInt(x.getAttribute("data-key"), 10));
                        outputEl.value = this.keys.join(",");
                    }

                    // add the card to the container element on the page
                    cardContainerEl.appendChild(card);
                }
            );
    }
}

/**
 * Inspired by https://github.com/WebDevSimplified/Drag-And-Drop/blob/master/script.js.
 * @param {Element} container 
 * @param {Number} y 
 * @returns {Element} closest
 */
function getDragAfterElement(container, y) {
    const closest = Array.from(container.querySelectorAll('.card:not(.dragging)'))
        .reduce(
            (closest, child) => {
                const box = child.getBoundingClientRect();
                const offset = y - box.top - box.height / 2;

                if (offset < 0 && offset > closest.offset) 
                {
                    return { offset: offset, element: child };
                } 
                else 
                {
                    return closest;
                }
            }, 
            { offset: Number.NEGATIVE_INFINITY }
        );

    return closest.element;
}