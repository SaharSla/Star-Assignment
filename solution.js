/**
 * Star Counter Application - Console Ready Version
 * 
 * This script enhances star rating lines with:
 * - Star counting and display with color coding
 * - Total stars calculation
 * - Interactive controls (add/remove stars, toggle bold)
 * - Smart half-star merging logic
 * 
 * Usage: Paste this entire code into Chrome DevTools Console
 * The HTML file must already be loaded in the browser.
 */

// ============================================
// CONSTANTS - Configuration Values
// ============================================
const STAR_LIMITS = {
    MIN: 1,
    MAX: 5
};

const COLOR_THRESHOLDS = {
    RED: 2,      // Lines with 2 or fewer stars (no half-star) = red
    YELLOW: 3    // Lines with 3 or more stars (no half-star) = yellow
};

const COLORS = {
    RED: 'red',
    YELLOW: 'yellow',
    GREEN: 'green'  // Any line with a half-star = green (regardless of count)
};

const CSS_CLASSES = {
    WRAPPER: 'wrapper',
    STAR_COUNT: 'star-count',
    STAR_CONTROLS: 'star-controls',
    FULL_STAR: 'fa-star',
    HALF_STAR: 'fa-star-half-o'
};

const ELEMENT_IDS = {
    MAIN_CONTAINER: 'main',
    TOTAL_DISPLAY: 'total-stars-display'
};

// Display styling constants
const COUNT_DISPLAY_STYLES = {
    marginLeft: '10px',
    fontSize: '16px',
    fontWeight: 'bold'
};

const TOTAL_DISPLAY_STYLES = {
    marginTop: '20px',
    padding: '15px',
    border: '2px solid white',
    fontSize: '20px',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#444',
    color: '#FFF'
};

const BUTTON_STYLES = {
    margin: '2px',
    padding: '5px 10px',
    fontSize: '12px',
    cursor: 'pointer',
    border: '1px solid #ccc',
    borderRadius: '3px',
    backgroundColor: '#555',
    color: '#FFF'
};

// DOM element cache to avoid repeated queries
let cachedMainContainer = null;
let cachedTotalDisplay = null;

// ============================================
// CORE BUSINESS LOGIC - Star Counting
// ============================================

/**
 * Counts full and half stars in a line element
 * @param {HTMLElement} lineElement - The wrapper div containing stars
 * @returns {Object} Object with fullStars, halfStars, and total count
 */
function countStarsInLine(lineElement) {
    const fullStars = lineElement.querySelectorAll(`.${CSS_CLASSES.FULL_STAR}`);
    const halfStars = lineElement.querySelectorAll(`.${CSS_CLASSES.HALF_STAR}`);
    
    const fullStarsCount = fullStars.length;
    const halfStarsCount = halfStars.length;
    const total = fullStarsCount + (halfStarsCount * 0.5);
    
    return {
        fullStars: fullStarsCount,
        halfStars: halfStarsCount,
        total: total
    };
}

/**
 * Determines the display color for a star count based on business rules:
 * - Green: if line has a half-star (regardless of total count)
 * - Red: if no half-star AND total <= 2
 * - Yellow: if no half-star AND total >= 3
 * 
 * @param {Object} starCount - Object with {fullStars, halfStars, total}
 * @returns {string} Color name
 */
function getColorForStarCount(starCount) {
    // Priority 1: Half-star always makes it green
    if (starCount.halfStars > 0) {
        return COLORS.GREEN;
    }
    
    // Priority 2: No half-star, check total count
    if (starCount.total <= COLOR_THRESHOLDS.RED) {
        return COLORS.RED;
    }
    
    return COLORS.YELLOW;
}

/**
 * Validates if a star count change is within allowed limits (1-5 stars)
 * @param {number} currentTotal - Current total star count
 * @param {number} changeAmount - Amount to change (can be negative)
 * @returns {boolean} True if change is allowed
 */
function isStarChangeAllowed(currentTotal, changeAmount) {
    const newTotal = currentTotal + changeAmount;
    return newTotal >= STAR_LIMITS.MIN && newTotal <= STAR_LIMITS.MAX;
}

// ============================================
// DOM UTILITIES - Element Creation & Caching
// ============================================

/**
 * Gets or caches the main container element
 * @returns {HTMLElement} Main container div
 */
function getMainContainer() {
    if (!cachedMainContainer) {
        cachedMainContainer = document.querySelector(`#${ELEMENT_IDS.MAIN_CONTAINER}`);
    }
    return cachedMainContainer;
}

/**
 * Creates and styles the count display element for a line
 * @param {HTMLElement} lineElement - Parent line element
 * @returns {HTMLElement} The created count display span
 */
function createCountDisplayElement(lineElement) {
    const countDisplay = document.createElement('span');
    countDisplay.classList.add(CSS_CLASSES.STAR_COUNT);
    Object.assign(countDisplay.style, COUNT_DISPLAY_STYLES);
    lineElement.appendChild(countDisplay);
    return countDisplay;
}

/**
 * Creates and styles the total display element at the bottom
 * @returns {HTMLElement} The created total display div
 */
function createTotalDisplayElement() {
    const totalDisplay = document.createElement('div');
    totalDisplay.id = ELEMENT_IDS.TOTAL_DISPLAY;
    Object.assign(totalDisplay.style, TOTAL_DISPLAY_STYLES);
    getMainContainer().appendChild(totalDisplay);
    return totalDisplay;
}

/**
 * Gets or creates the total display element (cached)
 * @returns {HTMLElement} Total display div
 */
function getTotalDisplay() {
    if (!cachedTotalDisplay) {
        cachedTotalDisplay = document.querySelector(`#${ELEMENT_IDS.TOTAL_DISPLAY}`) || 
                            createTotalDisplayElement();
    }
    return cachedTotalDisplay;
}

/**
 * Creates a star icon element using innerHTML (same method as original HTML)
 * This ensures Font Awesome processes the icon correctly
 * 
 * @param {string} starType - 'full' for full star, 'half' for half star
 * @returns {HTMLElement} The created star icon element
 */
function createStarIcon(starType) {
    // Create temporary container
    const tempDiv = document.createElement('div');
    
    // Use innerHTML (same as original HTML) to ensure Font Awesome processes it
    // This fixes the "square instead of star" bug
    if (starType === 'full') {
        tempDiv.innerHTML = `<i class="fa ${CSS_CLASSES.FULL_STAR}"></i>`;
    } else if (starType === 'half') {
        tempDiv.innerHTML = `<i class="fa ${CSS_CLASSES.HALF_STAR}"></i>`;
    }
    
    // Extract and return the icon element
    return tempDiv.firstElementChild;
}

/**
 * Finds the insertion point for new stars
 * Stars should be grouped together, before count display and buttons
 * @param {HTMLElement} lineElement - The line element
 * @returns {HTMLElement|null} Element to insert before, or null to append
 */
function findStarInsertionPoint(lineElement) {
    // Priority: insert before count display or button container
    const countDisplay = lineElement.querySelector(`.${CSS_CLASSES.STAR_COUNT}`);
    if (countDisplay) return countDisplay;
    
    const buttonContainer = lineElement.querySelector(`.${CSS_CLASSES.STAR_CONTROLS}`);
    if (buttonContainer) return buttonContainer;
    
    return null;
}

/**
 * Inserts a star element in the correct position (after existing stars, before count/buttons)
 * @param {HTMLElement} lineElement - Parent line element
 * @param {HTMLElement} starElement - Star icon element to insert
 * @param {HTMLElement|null} insertBefore - Optional element to insert before
 */
function insertStarElement(lineElement, starElement, insertBefore) {
    const targetElement = insertBefore || findStarInsertionPoint(lineElement);
    
    if (targetElement) {
        lineElement.insertBefore(starElement, targetElement);
    } else {
        lineElement.appendChild(starElement);
    }
}

// ============================================
// DISPLAY UPDATES - Line and Total Display
// ============================================

/**
 * Updates the star count display for a single line
 * @param {HTMLElement} lineElement - The line to update
 * @param {Object} starCount - Optional pre-calculated star count (for efficiency)
 */
function updateLineDisplay(lineElement, starCount) {
    const count = starCount || countStarsInLine(lineElement);
    
    let countDisplay = lineElement.querySelector(`.${CSS_CLASSES.STAR_COUNT}`);
    if (!countDisplay) {
        countDisplay = createCountDisplayElement(lineElement);
    }
    
    countDisplay.textContent = `${count.total} STARS`;
    countDisplay.style.color = getColorForStarCount(count);
}

/**
 * Updates all line displays and returns their star counts
 * @returns {Array} Array of star count objects
 */
function updateAllLinesDisplay() {
    const allLines = document.querySelectorAll(`.${CSS_CLASSES.WRAPPER}`);
    const starCounts = [];
    
    allLines.forEach(function(line) {
        const starCount = countStarsInLine(line);
        starCounts.push(starCount);
        updateLineDisplay(line, starCount);
    });
    
    return starCounts;
}

/**
 * Calculates total stars from an array of star count objects
 * @param {Array} starCounts - Array of {fullStars, halfStars, total} objects
 * @returns {number} Total star count
 */
function calculateTotalFromCounts(starCounts) {
    return starCounts.reduce(function(sum, count) {
        return sum + count.total;
    }, 0);
}

/**
 * Calculates total stars by querying all lines (fallback method)
 * @returns {number} Total star count
 */
function calculateTotalStars() {
    const allLines = document.querySelectorAll(`.${CSS_CLASSES.WRAPPER}`);
    let total = 0;
    allLines.forEach(function(line) {
        total += countStarsInLine(line).total;
    });
    return total;
}

/**
 * Updates the total stars display at the bottom
 * @param {number} total - Optional pre-calculated total (for efficiency)
 */
function updateTotalDisplay(total) {
    const calculatedTotal = total !== undefined ? total : calculateTotalStars();
    getTotalDisplay().textContent = `Total: ${calculatedTotal} STARS`;
}

/**
 * Updates all displays: lines and total (main update function)
 */
function updateAllDisplays() {
    const starCounts = updateAllLinesDisplay();
    const total = calculateTotalFromCounts(starCounts);
    updateTotalDisplay(total);
}

// ============================================
// STAR MANIPULATION - Add/Remove Logic
// ============================================

/**
 * Adds a full star to a line, positioned before any half-star
 * @param {HTMLElement} lineElement - The line to modify
 */
function addFullStar(lineElement) {
    const currentCount = countStarsInLine(lineElement);
    
    if (!isStarChangeAllowed(currentCount.total, 1)) {
        return; // Would exceed MAX_STARS
    }
    
    // Use helper function to create star (ensures Font Awesome compatibility)
    const starIcon = createStarIcon('full');
    
    // Insert before half-star if it exists, otherwise before count/buttons
    const halfStar = lineElement.querySelector(`.${CSS_CLASSES.HALF_STAR}`);
    const insertBefore = halfStar || findStarInsertionPoint(lineElement);
    insertStarElement(lineElement, starIcon, insertBefore);
}

/**
 * Removes the last full star from a line (maintains visual order)
 * @param {HTMLElement} lineElement - The line to modify
 */
function removeFullStar(lineElement) {
    const currentCount = countStarsInLine(lineElement);
    
    if (!isStarChangeAllowed(currentCount.total, -1)) {
        return; // Would go below MIN_STARS
    }
    
    const allFullStars = lineElement.querySelectorAll(`.${CSS_CLASSES.FULL_STAR}`);
    if (allFullStars.length > 0) {
        const lastFullStar = allFullStars[allFullStars.length - 1];
        lastFullStar.remove();
    }
}

/**
 * Adds a half-star to a line with smart merging logic:
 * - If a half-star already exists, merges it with the new one to create a full star
 * - If no half-star exists, adds a new half-star at the end
 * Half-stars always appear last (after all full stars)
 * 
 * @param {HTMLElement} lineElement - The line to modify
 */
function addHalfStar(lineElement) {
    const currentCount = countStarsInLine(lineElement);
    
    if (!isStarChangeAllowed(currentCount.total, 0.5)) {
        return; // Would exceed MAX_STARS
    }
    
    const existingHalfStar = lineElement.querySelector(`.${CSS_CLASSES.HALF_STAR}`);
    
    if (existingHalfStar) {
        // Merge: remove existing half-star and add a full star
        existingHalfStar.remove();
        
        // Use helper function to create star (ensures Font Awesome compatibility)
        const fullStarIcon = createStarIcon('full');
        
        // Insert after the last full star (before count/buttons)
        const allFullStars = lineElement.querySelectorAll(`.${CSS_CLASSES.FULL_STAR}`);
        const insertBefore = findStarInsertionPoint(lineElement);
        
        if (allFullStars.length > 0) {
            // Insert after last full star
            const lastFullStar = allFullStars[allFullStars.length - 1];
            const nextSibling = lastFullStar.nextSibling;
            lineElement.insertBefore(fullStarIcon, nextSibling || insertBefore);
        } else {
            insertStarElement(lineElement, fullStarIcon, insertBefore);
        }
    } else {
        // Add new half-star at the end (after all full stars)
        // Use helper function to create star (ensures Font Awesome compatibility)
        const halfStarIcon = createStarIcon('half');
        insertStarElement(lineElement, halfStarIcon, findStarInsertionPoint(lineElement));
    }
}

/**
 * Removes a half-star with smart conversion logic:
 * - If a half-star exists, removes it
 * - If no half-star exists (only full stars), converts the last full star into a half-star
 * 
 * @param {HTMLElement} lineElement - The line to modify
 */
function removeHalfStar(lineElement) {
    const currentCount = countStarsInLine(lineElement);
    
    if (!isStarChangeAllowed(currentCount.total, -0.5)) {
        return; // Would go below MIN_STARS
    }
    
    const existingHalfStar = lineElement.querySelector(`.${CSS_CLASSES.HALF_STAR}`);
    
    if (existingHalfStar) {
        // Half-star exists: simply remove it
        existingHalfStar.remove();
    } else {
        // No half-star: convert last full star to half-star
        const allFullStars = lineElement.querySelectorAll(`.${CSS_CLASSES.FULL_STAR}`);
        
        if (allFullStars.length > 0) {
            const lastFullStar = allFullStars[allFullStars.length - 1];
            // Use helper function to create star (ensures Font Awesome compatibility)
            const halfStarIcon = createStarIcon('half');
            
            // Replace full star with half-star
            lineElement.insertBefore(halfStarIcon, lastFullStar);
            lastFullStar.remove();
        }
    }
}

/**
 * Main handler for star changes (add/remove full or half stars)
 * Validates limits, performs the change, and updates displays
 * 
 * @param {HTMLElement} lineElement - The line to modify
 * @param {number} changeAmount - Amount to change: 1, -1, 0.5, or -0.5
 */
function handleStarChange(lineElement, changeAmount) {
    const currentCount = countStarsInLine(lineElement);
    
    if (!isStarChangeAllowed(currentCount.total, changeAmount)) {
        return; // Change would violate min/max limits
    }
    
    // Perform the appropriate change
    if (changeAmount === 1) {
        addFullStar(lineElement);
    } else if (changeAmount === -1) {
        removeFullStar(lineElement);
    } else if (changeAmount === 0.5) {
        addHalfStar(lineElement);
    } else if (changeAmount === -0.5) {
        removeHalfStar(lineElement);
    }
    
    // Update displays after change
    const newCount = countStarsInLine(lineElement);
    updateLineDisplay(lineElement, newCount);
    updateTotalDisplay();
}

// ============================================
// INTERACTIVE CONTROLS - Buttons & Click Handlers
// ============================================

/**
 * Creates a styled button element
 * @param {string} text - Button label
 * @param {string} buttonClass - CSS class name
 * @returns {HTMLElement} The created button element
 */
function createButton(text, buttonClass) {
    const button = document.createElement('button');
    button.textContent = text;
    button.className = buttonClass || 'star-button';
    Object.assign(button.style, BUTTON_STYLES);
    return button;
}

/**
 * Adds control buttons to a single line
 * Creates four buttons: Remove 1 Star, Add 1 Star, Remove 0.5 Star, Add 0.5 Star
 * 
 * @param {HTMLElement} lineElement - The line to add buttons to
 */
function addButtonsToLine(lineElement) {
    // Skip if buttons already exist
    if (lineElement.querySelector(`.${CSS_CLASSES.STAR_CONTROLS}`)) {
        return;
    }
    
    const buttonContainer = document.createElement('div');
    buttonContainer.className = CSS_CLASSES.STAR_CONTROLS;
    buttonContainer.style.marginLeft = '10px';
    buttonContainer.style.display = 'inline-block';
    
    // Create buttons
    const buttons = [
        { text: 'Remove 1 Star', change: -1 },
        { text: 'Add 1 Star', change: 1 },
        { text: 'Remove 0.5 Star', change: -0.5 },
        { text: 'Add 0.5 Star', change: 0.5 }
    ];
    
    buttons.forEach(function(buttonConfig) {
        const button = createButton(buttonConfig.text);
        
        button.addEventListener('click', function(e) {
            e.stopPropagation(); // Prevent line click event (bold toggle)
            handleStarChange(lineElement, buttonConfig.change);
        });
        
        buttonContainer.appendChild(button);
    });
    
    lineElement.appendChild(buttonContainer);
}

/**
 * Adds control buttons to all lines on the page
 */
function addButtonsToAllLines() {
    const allLines = document.querySelectorAll(`.${CSS_CLASSES.WRAPPER}`);
    allLines.forEach(function(line) {
        addButtonsToLine(line);
    });
}

/**
 * Toggles bold style for a line's count display
 * First click makes it bold, second click returns to normal
 * 
 * @param {HTMLElement} lineElement - The line to toggle
 */
function toggleBold(lineElement) {
    const countDisplay = lineElement.querySelector(`.${CSS_CLASSES.STAR_COUNT}`);
    if (!countDisplay) {
        return;
    }
    
    const currentWeight = window.getComputedStyle(countDisplay).fontWeight;
    const isBold = currentWeight === 'bold' || 
                  currentWeight === '700' || 
                  (parseInt(currentWeight) >= 700);
    
    countDisplay.style.fontWeight = isBold ? 'normal' : 'bold';
}

/**
 * Attaches click handlers to all lines for bold toggling
 * Uses data attribute to prevent duplicate handlers
 */
function attachClickHandlers() {
    const allLines = document.querySelectorAll(`.${CSS_CLASSES.WRAPPER}`);
    
    allLines.forEach(function(line) {
        if (line.dataset.clickHandlerAttached === 'true') {
            return; // Handler already attached
        }
        
        line.dataset.clickHandlerAttached = 'true';
        line.addEventListener('click', function() {
            toggleBold(line);
        });
        line.style.cursor = 'pointer';
    });
}

// ============================================
// INITIALIZATION
// ============================================

/**
 * Main initialization function
 * Sets up all functionality: displays, handlers, and controls
 */
function initializeStarCounter() {
    const allLines = document.querySelectorAll(`.${CSS_CLASSES.WRAPPER}`);
    
    if (allLines.length === 0) {
        console.warn('No star lines found. Make sure the HTML page is loaded and stars are created.');
        return;
    }
    
    // Initialize all features
    updateAllDisplays();        // Count and display stars with colors
    attachClickHandlers();      // Enable click-to-toggle-bold
    addButtonsToAllLines();     // Add control buttons
    
    console.log(`✓ Star counter initialized: ${allLines.length} lines processed`);
}

// Auto-initialize when pasted into console
initializeStarCounter();