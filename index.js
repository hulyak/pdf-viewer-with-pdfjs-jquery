const $pdf = 'document.pdf';

let $initialState = {
  pdfDoc: null,
  currentPage: 1,
  pageCount: 0,
  zoom: 1,
};

// Render the page
const renderPage = () => {
  // load the first page
  $initialState.pdfDoc.getPage($initialState.currentPage).then(function (page) {
    const canvas = $('#canvas')[0];
    const $ctx = canvas.getContext('2d');
    const $viewport = page.getViewport({ scale: $initialState.zoom });

    canvas.height = $viewport.height;
    canvas.width = $viewport.width;

    // Render PDF page into canvas context
    const renderCtx = {
      canvasContext: $ctx,
      viewport: $viewport,
    };

    page.render(renderCtx);

    $('#page_num').html($initialState.currentPage);
  });
};

// 1. Get Document
pdfjsLib
  .getDocument($pdf)
  .promise.then(function (doc) {
    $initialState.pdfDoc = doc;
    console.log('pdfDocument', $initialState.pdfDoc);

    $('#page_count').html($initialState.pdfDoc.numPages);

    renderPage();
  })
  .catch(function (err) {
    alert(err.message);
  });

function showPrevPage() {
  if ($initialState.pdfDoc === null || $initialState.currentPage <= 1) return;
  $initialState.currentPage--;
  // render the current page
  $('#current_page').val($initialState.currentPage);
  renderPage();
}

function showNextPage() {
  if (
    $initialState.pdfDoc === null ||
    $initialState.currentPage >= $initialState.pdfDoc._pdfInfo.numPages // comes from pdf.js
  )
    return;

  $initialState.currentPage++;
  $('#current_page').val($initialState.currentPage);
  renderPage();
}

// Button Events
$('#prev-page').click(showPrevPage);
$('#next-page').click(showNextPage);

$('#current_page').on('keypress', function (event) {
  if ($initialState.pdfDoc === null) return;
  // get the key code
  const $keycode = event.keyCode ? event.keyCode : event.which;

  if ($keycode === 13) {
    // enter key
    // get the new page number and render it
    let desiredPage = $('#current_page')[0].valueAsNumber;
    if (
      desiredPage >= 1 &&
      desiredPage <= $initialState.pdfDoc._pdfInfo.numPages // between the ranges of PDF pages
    ) {
      $initialState.currentPage = desiredPage;
      renderPage();
    }
  }
});

$('#zoom_in').on('click', function () {
  if ($initialState.pdfDoc === null) return;
  $initialState.zoom += 0.5;
  renderPage();
});

$('#zoom_out').on('click', function () {
  if ($initialState.pdfDoc === null) return;
  $initialState.zoom -= 0.5;
  renderPage();
});

// open a new PDF file
$('#file_upload').on('change', function (e) {
  console.log('clicked');
  var file = e.target.files[0];
  fileReader.readAsArrayBuffer(file);
  renderPage();
});
