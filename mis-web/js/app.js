// MIS Web Application
document.addEventListener('DOMContentLoaded', function() {
    // Configuration
    const API_BASE_URL = '/api';
    const DEFAULT_LIMIT = 50;
    
    // State variables
    let currentTable = null;
    let currentColumns = [];
    let selectedColumns = [];
    let currentFilters = {};
    let currentPage = 0;
    let totalRecords = 0;
    let pageSize = DEFAULT_LIMIT;
    let allTables = [];
    
    // DOM Elements
    const tableListElement = document.getElementById('table-list');
    const currentTableElement = document.getElementById('current-table');
    const columnSelectorElement = document.getElementById('column-selector');
    const columnCheckboxesElement = document.getElementById('column-checkboxes');
    const tablePlaceholderElement = document.getElementById('table-placeholder');
    const tableDataElement = document.getElementById('table-data');
    const tableHeaderElement = document.getElementById('table-header');
    const tableBodyElement = document.getElementById('table-body');
    const paginationInfoElement = document.getElementById('pagination-info');
    const prevBtnElement = document.getElementById('prev-btn');
    const nextBtnElement = document.getElementById('next-btn');
    const refreshBtnElement = document.getElementById('refresh-btn');
    const filterBtnElement = document.getElementById('filter-btn');
    const exportBtnElement = document.getElementById('export-btn');
    const filterFieldsElement = document.getElementById('filter-fields');
    const applyFilterBtnElement = document.getElementById('apply-filter-btn');
    const clearFilterBtnElement = document.getElementById('clear-filter-btn');
    const tableSearchElement = document.getElementById('table-search');
    const tablesCountElement = document.getElementById('tables-count');
    const tablesCountInfoElement = document.getElementById('tables-count-info');
    const selectAllColumnsElement = document.getElementById('select-all-columns');
    const deselectAllColumnsElement = document.getElementById('deselect-all-columns');
    const dbNameElement = document.getElementById('db-name');
    const doExportBtnElement = document.getElementById('do-export-btn');
    
    // Bootstrap Modals
    const filterModal = new bootstrap.Modal(document.getElementById('filterModal'));
    const exportModal = new bootstrap.Modal(document.getElementById('exportModal'));
    
    // Initialize the application
    init();
    
    function init() {
        // Set database name from path
        const dbPath = window.location.pathname.split('/').pop() || 'Database';
        dbNameElement.textContent = dbPath;
        
        // Load tables from the database
        loadTables();
        
        // Set up event listeners
        refreshBtnElement.addEventListener('click', () => loadTableData(currentTable));
        prevBtnElement.addEventListener('click', () => navigatePage(-1));
        nextBtnElement.addEventListener('click', () => navigatePage(1));
        filterBtnElement.addEventListener('click', showFilterModal);
        exportBtnElement.addEventListener('click', () => exportModal.show());
        applyFilterBtnElement.addEventListener('click', applyFilters);
        clearFilterBtnElement.addEventListener('click', clearFilters);
        tableSearchElement.addEventListener('input', filterTableList);
        selectAllColumnsElement.addEventListener('click', selectAllColumns);
        deselectAllColumnsElement.addEventListener('click', deselectAllColumns);
        doExportBtnElement.addEventListener('click', exportData);
    }
    
    // Load tables from the database
    function loadTables() {
        fetch(`${API_BASE_URL}/tables`)
            .then(response => response.json())
            .then(data => {
                if (data.tables && data.tables.length > 0) {
                    allTables = data.tables;
                    renderTableList(data.tables);
                    
                    // Update table count badges
                    tablesCountElement.textContent = data.tables.length;
                    tablesCountInfoElement.textContent = data.tables.length;
                } else {
                    tableListElement.innerHTML = '<div class="alert alert-info">No tables found in the database.</div>';
                    tablesCountElement.textContent = '0';
                    tablesCountInfoElement.textContent = '0';
                }
            })
            .catch(error => {
                console.error('Error loading tables:', error);
                tableListElement.innerHTML = `<div class="alert alert-danger">Error loading tables: ${error.message}</div>`;
                tablesCountElement.textContent = '0';
                tablesCountInfoElement.textContent = '0';
            });
    }
    
    // Render the list of tables
    function renderTableList(tables) {
        tableListElement.innerHTML = '';
        
        if (tables.length === 0) {
            tableListElement.innerHTML = '<div class="p-3 text-center text-muted">No tables match your search</div>';
            return;
        }
        
        tables.forEach(table => {
            const listItem = document.createElement('a');
            listItem.className = 'list-group-item list-group-item-action';
            listItem.innerHTML = `<i class="bi bi-table me-2"></i>${table}`;
            listItem.addEventListener('click', () => selectTable(table));
            
            // Mark as active if it's the current table
            if (table === currentTable) {
                listItem.classList.add('active');
            }
            
            tableListElement.appendChild(listItem);
        });
    }
    
    // Filter the table list based on search input
    function filterTableList() {
        const searchTerm = tableSearchElement.value.toLowerCase();
        
        if (!searchTerm) {
            renderTableList(allTables);
            return;
        }
        
        const filteredTables = allTables.filter(table => 
            table.toLowerCase().includes(searchTerm)
        );
        
        renderTableList(filteredTables);
    }
    
    // Select a table to view
    function selectTable(tableName) {
        // Update UI
        const tableItems = tableListElement.querySelectorAll('.list-group-item');
        tableItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Find the selected table item and add active class
        const selectedItem = Array.from(tableItems).find(item => item.textContent.includes(tableName));
        if (selectedItem) {
            selectedItem.classList.add('active');
        }
        
        // Update table name in header
        currentTableElement.innerHTML = `<i class="bi bi-table me-2"></i>${tableName}`;
        
        // Enable buttons
        refreshBtnElement.disabled = false;
        filterBtnElement.disabled = false;
        exportBtnElement.disabled = false;
        
        // Reset pagination and filters
        currentPage = 0;
        
        // Set current table
        currentTable = tableName;
        
        // Load columns for the selected table
        loadTableColumns(tableName);
    }
    
    // Select all columns
    function selectAllColumns() {
        const checkboxes = columnCheckboxesElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = true;
        });
        
        // Update selected columns array
        selectedColumns = [...currentColumns];
        
        // Reload table data
        loadTableData(currentTable);
    }
    
    // Deselect all columns
    function deselectAllColumns() {
        const checkboxes = columnCheckboxesElement.querySelectorAll('input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
        
        // Clear selected columns array
        selectedColumns = [];
        
        // Reload table data
        loadTableData(currentTable);
    }
    
    // Load columns for a table
    function loadTableColumns(tableName) {
        fetch(`${API_BASE_URL}/tables/${tableName}/columns`)
            .then(response => response.json())
            .then(data => {
                if (data.columns && data.columns.length > 0) {
                    currentColumns = data.columns;
                    selectedColumns = [...currentColumns]; // Initially select all columns
                    renderColumnSelector(data.columns);
                    loadTableData(tableName);
                } else {
                    columnCheckboxesElement.innerHTML = '<div class="alert alert-info">No columns found for this table.</div>';
                }
            })
            .catch(error => {
                console.error('Error loading columns:', error);
                columnCheckboxesElement.innerHTML = `<div class="alert alert-danger">Error loading columns: ${error.message}</div>`;
            });
    }
    
    // Render column selector checkboxes
    function renderColumnSelector(columns) {
        columnCheckboxesElement.innerHTML = '';
        columnSelectorElement.classList.remove('d-none');
        
        columns.forEach(column => {
            const checkboxDiv = document.createElement('div');
            checkboxDiv.className = 'form-check column-checkbox';
            
            const checkbox = document.createElement('input');
            checkbox.className = 'form-check-input';
            checkbox.type = 'checkbox';
            checkbox.id = `column-${column}`;
            checkbox.value = column;
            checkbox.checked = true;
            checkbox.addEventListener('change', handleColumnSelection);
            
            const label = document.createElement('label');
            label.className = 'form-check-label';
            label.htmlFor = `column-${column}`;
            label.textContent = column;
            
            checkboxDiv.appendChild(checkbox);
            checkboxDiv.appendChild(label);
            columnCheckboxesElement.appendChild(checkboxDiv);
        });
    }
    
    // Handle column selection change
    function handleColumnSelection(event) {
        const column = event.target.value;
        
        if (event.target.checked) {
            // Add column if not already in the array
            if (!selectedColumns.includes(column)) {
                selectedColumns.push(column);
            }
        } else {
            // Remove column from the array
            const index = selectedColumns.indexOf(column);
            if (index !== -1) {
                selectedColumns.splice(index, 1);
            }
        }
        
        // Reload table data with selected columns
        loadTableData(currentTable);
    }
    
    // Load table data with optional filters and column selection
    function loadTableData(tableName) {
        if (!tableName) return;
        
        // Show loading state
        tableBodyElement.innerHTML = `
            <tr>
                <td colspan="${selectedColumns.length}" class="text-center">
                    <div class="spinner-border text-primary" role="status">
                        <span class="visually-hidden">Loading...</span>
                    </div>
                </td>
            </tr>
        `;
        
        // Hide placeholder and show data table
        tablePlaceholderElement.classList.add('d-none');
        tableDataElement.classList.remove('d-none');
        
        // Build query parameters
        const params = new URLSearchParams();
        
        // Add selected columns
        if (selectedColumns.length > 0) {
            params.append('columns', selectedColumns.join(','));
        }
        
        // Add filters
        for (const [key, value] of Object.entries(currentFilters)) {
            if (value) {
                params.append(key, value);
            }
        }
        
        // Add pagination
        params.append('limit', pageSize);
        params.append('offset', currentPage * pageSize);
        
        // Fetch data
        fetch(`${API_BASE_URL}/tables/${tableName}/data?${params.toString()}`)
            .then(response => response.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                
                totalRecords = data.total;
                renderTableData(data.data);
                updatePagination();
            })
            .catch(error => {
                console.error('Error loading table data:', error);
                tableBodyElement.innerHTML = `
                    <tr>
                        <td colspan="${selectedColumns.length}" class="text-center">
                            <div class="alert alert-danger">Error loading data: ${error.message}</div>
                        </td>
                    </tr>
                `;
            });
    }
    
    // Render table data
    function renderTableData(data) {
        // Render table header
        tableHeaderElement.innerHTML = '';
        const headerRow = document.createElement('tr');
        
        selectedColumns.forEach(column => {
            const th = document.createElement('th');
            th.textContent = column;
            headerRow.appendChild(th);
        });
        
        tableHeaderElement.appendChild(headerRow);
        
        // Render table body
        tableBodyElement.innerHTML = '';
        
        if (data.length === 0) {
            const emptyRow = document.createElement('tr');
            const emptyCell = document.createElement('td');
            emptyCell.colSpan = selectedColumns.length;
            emptyCell.className = 'text-center';
            emptyCell.textContent = 'No data found';
            emptyRow.appendChild(emptyCell);
            tableBodyElement.appendChild(emptyRow);
            return;
        }
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            
            selectedColumns.forEach(column => {
                const td = document.createElement('td');
                td.textContent = row[column] !== null ? row[column] : '';
                tr.appendChild(td);
            });
            
            tableBodyElement.appendChild(tr);
        });
    }
    
    // Update pagination controls
    function updatePagination() {
        const startRecord = currentPage * pageSize + 1;
        const endRecord = Math.min((currentPage + 1) * pageSize, totalRecords);
        
        paginationInfoElement.textContent = `Showing ${startRecord} to ${endRecord} of ${totalRecords} records`;
        
        // Update button states
        prevBtnElement.disabled = currentPage === 0;
        nextBtnElement.disabled = endRecord >= totalRecords;
    }
    
    // Navigate between pages
    function navigatePage(direction) {
        currentPage += direction;
        if (currentPage < 0) currentPage = 0;
        
        loadTableData(currentTable);
    }
    
    // Show filter modal
    function showFilterModal() {
        // Generate filter fields based on current columns
        filterFieldsElement.innerHTML = '';
        
        currentColumns.forEach(column => {
            const div = document.createElement('div');
            div.className = 'col-md-6 mb-3 filter-field';
            
            const label = document.createElement('label');
            label.className = 'form-label';
            label.htmlFor = `filter-${column}`;
            label.innerHTML = `<i class="bi bi-funnel me-1"></i> Filter by ${column}:`;
            
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'form-control';
            input.id = `filter-${column}`;
            input.name = column;
            input.placeholder = `Enter value for ${column}`;
            
            // Set current value if exists
            if (currentFilters[column]) {
                input.value = currentFilters[column];
            }
            
            div.appendChild(label);
            div.appendChild(input);
            filterFieldsElement.appendChild(div);
        });
        
        // Show the modal
        filterModal.show();
    }
    
    // Apply filters from the modal
    function applyFilters() {
        // Reset filters
        currentFilters = {};
        
        // Get all filter inputs
        const filterInputs = filterFieldsElement.querySelectorAll('input');
        
        // Add non-empty filters to the currentFilters object
        filterInputs.forEach(input => {
            if (input.value.trim() !== '') {
                currentFilters[input.name] = input.value.trim();
            }
        });
        
        // Reset pagination
        currentPage = 0;
        
        // Reload data with new filters
        loadTableData(currentTable);
        
        // Hide the modal
        filterModal.hide();
    }
    
    // Clear all filters
    function clearFilters() {
        // Clear filter inputs in the modal
        const filterInputs = filterFieldsElement.querySelectorAll('input');
        filterInputs.forEach(input => {
            input.value = '';
        });
        
        // Clear the filters object
        currentFilters = {};
    }
    
    // Export data function
    function exportData() {
        const format = document.getElementById('export-format').value;
        const includeHeaders = document.getElementById('export-headers').checked;
        const exportAllPages = document.getElementById('export-all-pages').checked;
        
        // Get current data or all data
        let dataToExport;
        
        if (exportAllPages) {
            // Fetch all data for export (ignoring pagination)
            const params = new URLSearchParams();
            
            // Add selected columns
            if (selectedColumns.length > 0) {
                params.append('columns', selectedColumns.join(','));
            }
            
            // Add filters
            for (const [key, value] of Object.entries(currentFilters)) {
                if (value) {
                    params.append(key, value);
                }
            }
            
            // Set a large limit to get all data
            params.append('limit', 10000);
            params.append('offset', 0);
            
            fetch(`${API_BASE_URL}/tables/${currentTable}/data?${params.toString()}`)
                .then(response => response.json())
                .then(data => {
                    if (data.error) {
                        throw new Error(data.error);
                    }
                    
                    processExport(data.data, format, includeHeaders);
                })
                .catch(error => {
                    console.error('Error exporting data:', error);
                    alert(`Error exporting data: ${error.message}`);
                });
        } else {
            // Use current data in the table
            const tableRows = tableBodyElement.querySelectorAll('tr');
            const data = [];
            
            tableRows.forEach(row => {
                const rowData = {};
                const cells = row.querySelectorAll('td');
                
                cells.forEach((cell, index) => {
                    rowData[selectedColumns[index]] = cell.textContent;
                });
                
                data.push(rowData);
            });
            
            processExport(data, format, includeHeaders);
        }
        
        // Hide the modal
        exportModal.hide();
    }
    
    // Process and download export
    function processExport(data, format, includeHeaders) {
        let content = '';
        let filename = `${currentTable}_export_${new Date().toISOString().slice(0, 10)}`;
        let mimeType = '';
        
        if (format === 'csv') {
            content = convertToCSV(data, includeHeaders);
            filename += '.csv';
            mimeType = 'text/csv';
        } else if (format === 'json') {
            content = JSON.stringify(data, null, 2);
            filename += '.json';
            mimeType = 'application/json';
        }
        
        // Create download link
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
    
    // Convert data to CSV format
    function convertToCSV(data, includeHeaders) {
        if (!data || data.length === 0) return '';
        
        const headers = Object.keys(data[0]);
        let csv = '';
        
        // Add headers
        if (includeHeaders) {
            csv += headers.join(',') + '\n';
        }
        
        // Add data rows
        data.forEach(row => {
            const values = headers.map(header => {
                const value = row[header];
                // Handle values with commas by quoting them
                return value !== null && value !== undefined ? 
                    `"${String(value).replace(/"/g, '""')}"` : '';
            });
            csv += values.join(',') + '\n';
        });
        
        return csv;
    }
});
