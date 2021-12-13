const url = 'document.pdf';

let $pdfDoc = null,
  $pageNum = 1,
  $pageIsRendering = false,
  $pageNumIsPending = null;

const $scale = 1.5;

$('#zoom').on('input', function () {
  // this #zoom
  $('#zoomValue').text($('#zoom').val() + '%');
  $pdfDoc.scale = parseInt($('#zoom').val()) / 100;
  queueRenderPage($pdfDoc);
});

// Render the page
const renderPage = (num) => {
  $pageIsRendering = true;

  $pdfDoc.getPage(num).then((page) => {
    console.log('page', page);
    const $ctx = $('#canvas')[0].getContext('2d');
    const $viewport = page.getViewport({ scale: $scale });
    $('#canvas')[0].height = $viewport.height;
    $('#canvas')[0].width = $viewport.width;

    const renderCtx = {
      canvasContext: $ctx,
      viewport: $viewport,
    };

    page.render(renderCtx).promise.then(() => {
      $pageIsRendering = false;

      if ($pageNumIsPending !== null) {
        renderPage($pageNumIsPending);
        $pageNumIsPending = null;
      }
    });

    $('#page-num').html(num);
  });
};

// Check for pages rendering
const queueRenderPage = (num) => {
  if ($pageIsRendering) {
    $pageNumIsPending = num;
  } else {
    renderPage(num);
  }
};

// 1. Get Document
function getDocument() {
  pdfjsLib
    .getDocument(url)
    .promise.then((pdfDoc_) => {
      $pdfDoc = pdfDoc_;
      console.log('pdfDocument', $pdfDoc);
      $('#page-count').html($pdfDoc.numPages);

      renderPage($pageNum);
    })
    .catch((err) => {
      alert(err.message);
    });
}

const showPrevPage = () => {
  if ($pageNum <= 1) {
    return;
  }
  $pageNum--;
  queueRenderPage($pageNum);
};

const showNextPage = () => {
  if ($pageNum >= $pdfDoc.numPages) {
    return;
  }
  $pageNum++;
  queueRenderPage($pageNum);
};

// Button Events
$('#prev-page').click(showPrevPage);
$('#next-page').click(showNextPage);

// open a new PDF file
$('#fileUpload').on('change', function (e) {
  const $file = e.target.files[0];
  const $reader = new FileReader();
  $reader.readAsDataURL($file);
  $reader.onload = function () {
    getDocument($reader.result);
  };
});

getDocument();
