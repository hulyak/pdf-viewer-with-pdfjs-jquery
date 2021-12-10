const url = 'Document.pdf';

let $pdfDoc = null,
  $pageNum = 1,
  $pageIsRendering = false,
  $pageNumIsPending = null;

const $scale = 1.5; // size of the pdf
const $ctx = $('#pdf-render')[0].getContext('2d');

// Render the page
const renderPage = (num) => {
  $pageIsRendering = true;

  // Get the page pdfDoc object
  $pdfDoc.getPage(num).done((page) => {
    console.log('page', page);
    const $viewport = page.getViewport({ scale: $scale });
    $('#pdf-render').height = $viewport.height;
    $('#pdf-render').width = $viewport.width;

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

    // Output current page
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

// Get Document
pdfjsLib
  .getDocument(url)
  .promise.then((pdfDoc_) => {
    $pdfDoc = pdfDoc_;
    console.log('pdfDocument', $pdfDoc);
    $('#page-count').html($pdfDoc.numPages);

    renderPage($pageNum);
  })
  .fail((err) => {
    const $div = $('<div></div>')
      .addClass('error')
      .append(document.createTextNode(err.message));

    $('body').insertBefore($div, $('#pdf-render'));

    $('.top-bar').css({ display: 'none' });
  });

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
