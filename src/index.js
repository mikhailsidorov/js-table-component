function Table(options) {
  let self = this;
  let currentPage = options.currentPage;
  let totalPages = getTotalPages();
  let sortedColNum = null;
  let sortingType = 'asc';
  let searchValue = '';

  let search = null;
  let table = null;
  let pagination = null;

  self.element = document.createElement('div');
  self.element.className = 'table-component';

  self.element.addEventListener(
    'currentPageWasChanged',
    currentPageWasChangedHandler,
  );

  function currentPageWasChangedHandler() {
    render();
  }

  function getTotalPages() {
    let totalPages = Math.floor(options.items.length / options.itemsPerPage);
    if (options.items.length % options.itemsPerPage > 0) {
      totalPages += 1;
    }
    return totalPages;
  }

  render();

  function render() {
    renderSearch(self.element);
    renderTable(self.element);
    renderPagination(self.element);
  }

  function renderSearch(parent) {
    if (search) {
      parent.removeChild(search);
    }
    search = createSearch();
    parent.appendChild(search);
  }

  function renderTable(parent) {
    if (table) {
      parent.removeChild(table);
    }
    table = createTable();
    parent.appendChild(table);
  }

  function renderPagination(parent) {
    if (pagination) {
      parent.removeChild(pagination);
    }
    pagination = createPagination();
    parent.appendChild(pagination);
  }

  function createTable() {
    let table = document.createElement('div');
    table.onmousedown = () => false;
    table.className = 'table-component__table';
    renderHeader(table);
    renderRows(table);
    return table;
  }

  function createSearch() {
    let search = document.createElement('div');
    search.className = 'table-component__search';

    let searchLabel = document.createElement('label');
    searchLabel.className = 'table-component__search__label';
    searchLabel.setAttribute('for', 'table-component__search__input');
    searchLabel.textContent = 'Search:';
    search.appendChild(searchLabel);

    let searchInput = document.createElement('input');
    searchInput.className = 'table-component__search__input';
    searchInput.value = searchValue;
    search.appendChild(searchInput);

    let searchButton = document.createElement('button');
    searchButton.className = 'table-component__search__button';
    searchButton.textContent = 'search';
    searchButton.onclick = function() {
      searchValue = searchInput.value;
      render();
    };
    search.appendChild(searchButton);

    return search;
  }

  function renderHeader(parent) {
    let headerData = options.header || [];

    headerData.forEach(function(headerItemData) {
      let headerItem = document.createElement('div');
      headerItem.className = 'table-component__table__header-item';
      headerItem.textContent = headerItemData;

      headerItem.onclick = function(event) {
        const newSortedColNum = options.header.indexOf(
          event.target.textContent,
        );
        if (sortedColNum === newSortedColNum) {
          if (sortingType === 'asc') {
            sortingType = 'desc';
          } else {
            sortingType = 'asc';
          }
        } else {
          sortingType = 'asc';
        }
        sortedColNum = newSortedColNum;

        let comp = null;
        switch (sortingType) {
          case 'asc':
            comp = function(row1, row2) {
              if (typeof row1[sortedColNum] === 'number') {
                return row1[sortedColNum] - row2[sortedColNum];
              }
              if (typeof row1[sortedColNum] === 'string') {
                if (row1[sortedColNum].startsWith('$')) {
                  return (
                    !row1[sortedColNum].replace('$', '') -
                    row2[sortedColNum].replace('$', '')
                  );
                } else {
                  return row2[sortedColNum].localeCompare(row1[sortedColNum]);
                }
              }
            };
            break;
          case 'desc':
            comp = function(row1, row2) {
              if (typeof row1[sortedColNum] === 'number') {
                return !row1[sortedColNum] - row2[sortedColNum];
              }
              if (typeof row1[sortedColNum] === 'string') {
                if (row1[sortedColNum].startsWith('$')) {
                  return (
                    row1[sortedColNum].replace('$', '') -
                    row2[sortedColNum].replace('$', '')
                  );
                } else {
                  return row1[sortedColNum].localeCompare(row2[sortedColNum]);
                }
              }
            };
            break;
        }
        options.items.sort(comp);
        render();
      };

      parent.appendChild(headerItem);
    });
  }

  function getRange(array, first, last) {
    let range = [];
    if (last > array.length - 1) {
      last = array.length - 1;
    }
    for (let i = first; i <= last; i++) {
      range.push(array[i]);
    }
    return range;
  }

  function renderRows(parent) {
    function renderRow(rowData) {
      rowData.forEach(function(rowItem, index) {
        let cell = document.createElement('div');
        cell.textContent = rowItem;
        if (index !== sortedColNum) {
          cell.className = 'table-component__table__cell';
        } else {
          cell.classList.add('table-component__table__cell__sorted-column');
        }
        if (odd) {
          if (index !== sortedColNum) {
            cell.classList.add('table-component__table__odd-row');
          } else {
            cell.classList.add(
              'table-component__table__odd-row__sorted-column',
            );
          }
        }
        parent.appendChild(cell);
      });
      odd = !odd;
    }

    let rowsData = [];
    if (searchValue !== '') {
      rowsData = options.items.filter(function(rowData) {
        for (let rowItem of rowData) {
          if (
            rowItem
              .toString()
              .toUpperCase()
              .includes(searchValue.toUpperCase())
          ) {
            return true;
          }
        }
        return false;
      });
    } else {
      rowsData = options.items || [];
    }

    let odd = true;
    const first = (currentPage - 1) * options.itemsPerPage;
    const last = currentPage * options.itemsPerPage - 1;
    const currentRange = getRange(rowsData, first, last);
    currentRange.forEach(function(rowData) {
      renderRow(rowData);
    });
  }

  function createPagination() {
    let currentPageWasChanged = new Event('currentPageWasChanged', {
      bubbles: true,
    });
    const className = 'table-component__pagination';
    let element = document.createElement('div');
    element.className = className;
    let controls = [];
    let pagesButtons = [];

    controls.push(
      createPaginationButton(
        'Previous',
        `${className}__item-previous`,
        previousClickHandler,
      ),
    );
    controls.push(
      createPaginationButton(
        'Next',
        `${className}__item-next`,
        nextClickHandler,
      ),
    );
    controls.forEach(button => element.appendChild(button));

    pagesButtons = createPagesButtons(totalPages);
    pagesButtons.forEach(button => {
      element.insertBefore(button, controls[controls.length - 1]);
    });

    return element;

    function createPagesButtons() {
      let pagesButtons = [];
      for (let i = 1; i <= totalPages; i++) {
        pagesButtons.push(
          createPaginationButton(i, `${className}__item`, pageButtonClick),
        );
      }
      return pagesButtons;
    }

    function createPaginationButton(label, className, onclickHandler) {
      let button = document.createElement('div');
      button.className = className;
      button.textContent = label;
      if (label === currentPage) {
        button.classList.add(`${className}-active`);
      }
      button.onclick = onclickHandler;
      button.onmousedown = () => false;
      return button;
    }

    function pageButtonClick(event) {
      currentPage = +event.target.innerHTML;
      self.element.dispatchEvent(currentPageWasChanged);
    }

    function previousClickHandler() {
      if (currentPage > 1) {
        currentPage -= 1;
        self.element.dispatchEvent(currentPageWasChanged);
      } else {
        return false;
      }
    }

    function nextClickHandler() {
      if (currentPage < totalPages) {
        currentPage += 1;
        self.element.dispatchEvent(currentPageWasChanged);
      } else {
        return false;
      }
    }
  }
}

const tableData = {
  currentPage: 1,
  itemsPerPage: 10,
  header: ['Name', 'Position', 'Office', 'Age', 'Start date', 'Salary'],
  items: [
    ['Thor Walton', 'Developer', 'New York', 61, '2013/08/11', '$98540'],
    ['Quinn Flynn', 'Support Lead', 'Edinburgh', 22, '2013/03/03', '$342000'],
    [
      'Jenifer Acosta',
      'Junior Javascript Developer',
      'Edinburgh',
      43,
      '2013/02/01',
      '$75650',
    ],
    [
      'Leanne Graham',
      'Integration Specialist',
      'Gwenborough',
      38,
      '2013/10/11',
      '$12345',
    ],
    [
      'Ervin Howell',
      'Integration Specialist',
      'Wisokyburgh',
      29,
      '2013/1/2',
      '$168845',
    ],
    [
      'Clementine Lebsack',
      'Software Engineer',
      'Gwenborough',
      43,
      '2013/5/8',
      '$12345',
    ],
    [
      'Clementine Bauch',
      'Marketing Designer',
      'Gwenborough',
      44,
      '2013/6/3',
      '$124345',
    ],
    [
      'Clementina DuBuque',
      'Designer',
      'Gwenborough',
      45,
      '2013/5/8',
      '$123485',
    ],
    ['Maxime_Nienow', 'Sales Manager', 'Roscoeview', 46, '2013/5/8', '$123465'],
    [
      'Glenna Reichert',
      'Sales Assistant',
      'South Christy',
      47,
      '2013/5/4',
      '$102345',
    ],
    [
      'Kurtis Weissnat',
      'Software Engineer',
      'Gwenborough',
      48,
      '2013/2/8',
      '$22345',
    ],
    [
      'Dennis Schulist',
      'Software Engineer',
      'Howemouth',
      49,
      '2013/6/11',
      '$14545',
    ],
  ],
};

document.addEventListener('DOMContentLoaded', function() {
  let myTable = new Table(tableData);
  document.getElementById('table-contaner').appendChild(myTable.element);
});
