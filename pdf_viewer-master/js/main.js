// const url = 'docs/pdf.pdf';
const url = sessionStorage.getItem('pdfUrl'); 

let pdfDoc = null,
  pageNum = 1,
  pageIsRendering = false,
  pageNumIsPending = null;

const scale = 1.5,
  canvas = document.querySelector('#pdf-render'),
  ctx = canvas.getContext('2d');

// Render the page
const renderPage = num => {
  pageIsRendering = true;

  // Get page
  pdfDoc.getPage(num).then(page => {
    // Set scale
    const viewport = page.getViewport({ scale });
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderCtx = {
      canvasContext: ctx,
      viewport
    };

    page.render(renderCtx).promise.then(() => {
      pageIsRendering = false;

      if (pageNumIsPending !== null) {
        renderPage(pageNumIsPending);
        pageNumIsPending = null;
      }
    });

    // Output current page
    document.querySelector('#page-num').textContent = num;
    document.querySelector('#page-num-input').value = num; // Update input field with current page number
  });

  // Update pagination buttons
  document.querySelector('#prev-page').disabled = pageNum <= 1;
  document.querySelector('#next-page').disabled = pageNum >= pdfDoc.numPages;
};

// Check for pages rendering
const queueRenderPage = num => {
  if (pageIsRendering) {
    pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// Show Prev Page
const showPrevPage = () => {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
};

// Show Next Page
const showNextPage = () => {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
};

// Go to a specific page
const goToPage = () => {
  const pageNumInput = document.querySelector('#page-num-input');
  let targetPage = parseInt(pageNumInput.value);

  // Check if the input is valid
  if (isNaN(targetPage) || targetPage < 1 || targetPage > pdfDoc.numPages) {
    alert('Please enter a valid page number');
    return;
  }

  pageNum = targetPage;
  queueRenderPage(pageNum);
};

// Get Document
pdfjsLib
  .getDocument(url)
  .promise.then(pdfDoc_ => {
    pdfDoc = pdfDoc_;
    document.querySelector('#page-count').textContent = pdfDoc.numPages;

    renderPage(pageNum);
  })
  .catch(err => {
    // Display error
    const div = document.createElement('div');
    div.className = 'error';
    div.appendChild(document.createTextNode(err.message));
    document.querySelector('body').insertBefore(div, canvas);
    // Remove top bar
    document.querySelector('.top-bar').style.display = 'none';
  });

// Button Events
document.querySelector('#prev-page').addEventListener('click', showPrevPage);
document.querySelector('#next-page').addEventListener('click', showNextPage);
document.querySelector('#go-to-page').addEventListener('click', goToPage);

// Optional: Handle "Enter" key press for quick navigation
document.querySelector('#page-num-input').addEventListener('keydown', event => {
  if (event.key === 'Enter') {
    goToPage();
  }
});



