import type { GridLocaleText } from "@mui/x-data-grid-pro";

// Custom MUI X Data Grid localeText for Hindi (hi-IN).
//
// MUI X ships no Hindi Data Grid locale, so we supply our own. This is a FULL
// translation of GridLocaleText (every key MUI exposes), not a reachable-only
// subset — the grid is used across the whole app in many configurations
// (toolbar, filtering, export, row selection, aggregation, detail panels…),
// so translating everything avoids silent English fallback when any grid
// enables a feature.
//
// Typed Partial<GridLocaleText>: any key MUI adds in a future version that we
// haven't translated yet falls back to its built-in English rather than
// erroring. The 7 function entries mirror MUI's default signatures.
//
// To add another unshipped locale: create a sibling file here exporting a
// Partial<GridLocaleText> and register it in ../datagrid.ts.
export const hiIN: Partial<GridLocaleText> = {
  // Overlays
  noRowsLabel: "कोई पंक्तियाँ नहीं हैं",
  noResultsOverlayLabel: "कोई परिणाम नहीं मिला।",

  // Toolbar — density
  toolbarDensity: "घनत्व",
  toolbarDensityLabel: "घनत्व",
  toolbarDensityCompact: "संकुचित",
  toolbarDensityStandard: "मानक",
  toolbarDensityComfortable: "आरामदायक",

  // Toolbar — columns
  toolbarColumns: "कॉलम",
  toolbarColumnsLabel: "कॉलम चुनें",

  // Toolbar — filters
  toolbarFilters: "फ़िल्टर",
  toolbarFiltersLabel: "फ़िल्टर दिखाएं",
  toolbarFiltersTooltipHide: "फ़िल्टर छुपाएं",
  toolbarFiltersTooltipShow: "फ़िल्टर दिखाएं",
  toolbarFiltersTooltipActive: (count) => `${count} सक्रिय फ़िल्टर`,

  // Toolbar — quick filter
  toolbarQuickFilterPlaceholder: "खोजें…",
  toolbarQuickFilterLabel: "खोजें",
  toolbarQuickFilterDeleteIconLabel: "साफ़ करें",

  // Toolbar — export
  toolbarExport: "निर्यात",
  toolbarExportLabel: "निर्यात",
  toolbarExportCSV: "CSV के रूप में डाउनलोड करें",
  toolbarExportPrint: "प्रिंट करें",
  toolbarExportExcel: "Excel के रूप में डाउनलोड करें",

  // Columns management panel
  columnsManagementSearchTitle: "खोजें",
  columnsManagementNoColumns: "कोई कॉलम नहीं",
  columnsManagementShowHideAllText: "सभी दिखाएं/छुपाएं",
  columnsManagementReset: "रीसेट करें",
  columnsManagementDeleteIconLabel: "साफ़ करें",

  // Filter panel
  filterPanelAddFilter: "फ़िल्टर जोड़ें",
  filterPanelRemoveAll: "सभी हटाएं",
  filterPanelDeleteIconLabel: "हटाएं",
  filterPanelLogicOperator: "तार्किक ऑपरेटर",
  filterPanelOperator: "ऑपरेटर",
  filterPanelOperatorAnd: "और",
  filterPanelOperatorOr: "या",
  filterPanelColumns: "कॉलम",
  filterPanelInputLabel: "मान",
  filterPanelInputPlaceholder: "फ़िल्टर मान",

  // Filter operators
  filterOperatorContains: "शामिल है",
  filterOperatorDoesNotContain: "शामिल नहीं है",
  filterOperatorEquals: "बराबर है",
  filterOperatorDoesNotEqual: "बराबर नहीं है",
  filterOperatorStartsWith: "से शुरू होता है",
  filterOperatorEndsWith: "से समाप्त होता है",
  filterOperatorIs: "है",
  filterOperatorNot: "नहीं है",
  filterOperatorAfter: "के बाद है",
  filterOperatorOnOrAfter: "को या उसके बाद है",
  filterOperatorBefore: "के पहले है",
  filterOperatorOnOrBefore: "को या उससे पहले है",
  filterOperatorIsEmpty: "खाली है",
  filterOperatorIsNotEmpty: "खाली नहीं है",
  filterOperatorIsAnyOf: "इनमें से कोई है",
  "filterOperator=": "=",
  "filterOperator!=": "!=",
  "filterOperator>": ">",
  "filterOperator>=": ">=",
  "filterOperator<": "<",
  "filterOperator<=": "<=",

  // Header filter operators
  headerFilterOperatorContains: "शामिल है",
  headerFilterOperatorDoesNotContain: "शामिल नहीं है",
  headerFilterOperatorEquals: "बराबर है",
  headerFilterOperatorDoesNotEqual: "बराबर नहीं है",
  headerFilterOperatorStartsWith: "से शुरू होता है",
  headerFilterOperatorEndsWith: "से समाप्त होता है",
  headerFilterOperatorIs: "है",
  headerFilterOperatorNot: "नहीं है",
  headerFilterOperatorAfter: "के बाद है",
  headerFilterOperatorOnOrAfter: "को या उसके बाद है",
  headerFilterOperatorBefore: "के पहले है",
  headerFilterOperatorOnOrBefore: "को या उससे पहले है",
  headerFilterOperatorIsEmpty: "खाली है",
  headerFilterOperatorIsNotEmpty: "खाली नहीं है",
  headerFilterOperatorIsAnyOf: "इनमें से कोई है",
  "headerFilterOperator=": "बराबर है",
  "headerFilterOperator!=": "बराबर नहीं है",
  "headerFilterOperator>": "इससे बड़ा है",
  "headerFilterOperator>=": "इससे बड़ा या बराबर है",
  "headerFilterOperator<": "इससे छोटा है",
  "headerFilterOperator<=": "इससे छोटा या बराबर है",

  // Filter values
  filterValueAny: "कोई भी",
  filterValueTrue: "सत्य",
  filterValueFalse: "असत्य",

  // Column menu
  columnMenuLabel: "मेनू",
  columnMenuAriaLabel: (columnName) => `${columnName} कॉलम मेनू`,
  columnMenuShowColumns: "कॉलम दिखाएं",
  columnMenuManageColumns: "कॉलम प्रबंधित करें",
  columnMenuFilter: "फ़िल्टर",
  columnMenuHideColumn: "कॉलम छुपाएं",
  columnMenuUnsort: "क्रमबद्धता हटाएं",
  columnMenuSortAsc: "बढ़ते क्रम (ASC) में क्रमबद्ध करें",
  columnMenuSortDesc: "घटते क्रम (DESC) में क्रमबद्ध करें",

  // Column header
  columnHeaderFiltersTooltipActive: (count) => `${count} सक्रिय फ़िल्टर`,
  columnHeaderFiltersLabel: "फ़िल्टर दिखाएं",
  columnHeaderSortIconLabel: "क्रमबद्ध करें",

  // Footer
  footerRowSelected: (count) =>
    count !== 1
      ? `${count.toLocaleString()} पंक्तियाँ चयनित`
      : `${count.toLocaleString()} पंक्ति चयनित`,
  footerTotalRows: "कुल पंक्तियाँ:",
  footerTotalVisibleRows: (visibleCount, totalCount) =>
    `${totalCount.toLocaleString()} में से ${visibleCount.toLocaleString()}`,

  // Checkbox selection
  checkboxSelectionHeaderName: "चेकबॉक्स चयन",
  checkboxSelectionSelectAllRows: "सभी पंक्तियाँ चुनें",
  checkboxSelectionUnselectAllRows: "सभी पंक्तियों का चयन रद्द करें",
  checkboxSelectionSelectRow: "पंक्ति चुनें",
  checkboxSelectionUnselectRow: "पंक्ति का चयन रद्द करें",

  // Boolean cell
  booleanCellTrueLabel: "हाँ",
  booleanCellFalseLabel: "नहीं",

  // Actions cell
  actionsCellMore: "अधिक",

  // Column pinning (DataGridPro)
  pinToLeft: "बाईं ओर पिन करें",
  pinToRight: "दाईं ओर पिन करें",
  unpin: "पिन हटाएं",

  // Tree data
  treeDataGroupingHeaderName: "समूह",
  treeDataExpand: "उप-आइटम देखें",
  treeDataCollapse: "उप-आइटम छुपाएं",

  // Grouping
  groupingColumnHeaderName: "समूह",
  groupColumn: (name) => `${name} के अनुसार समूहित करें`,
  unGroupColumn: (name) => `${name} के अनुसार समूहन रोकें`,

  // Master/detail
  detailPanelToggle: "विवरण पैनल टॉगल करें",
  expandDetailPanel: "विस्तृत करें",
  collapseDetailPanel: "संक्षिप्त करें",

  // Row reordering
  rowReorderingHeaderName: "पंक्ति पुनर्क्रमण",

  // Aggregation
  aggregationMenuItemHeader: "समुच्चय",
  aggregationFunctionLabelSum: "योग",
  aggregationFunctionLabelAvg: "औसत",
  aggregationFunctionLabelMin: "न्यूनतम",
  aggregationFunctionLabelMax: "अधिकतम",
  aggregationFunctionLabelSize: "संख्या",

  // Pagination footer (passed through to MUI core TablePagination, which
  // otherwise defaults to English regardless of the grid locale).
  MuiTablePagination: {
    labelRowsPerPage: "प्रति पृष्ठ पंक्तियाँ:",
    labelDisplayedRows: ({ from, to, count }) =>
      `${
        count !== -1 ? count.toLocaleString() : `${to.toLocaleString()} से अधिक`
      } में से ${from.toLocaleString()}–${to.toLocaleString()}`,
    getItemAriaLabel: (type) => {
      if (type === "first") return "पहले पृष्ठ पर जाएं";
      if (type === "last") return "अंतिम पृष्ठ पर जाएं";
      if (type === "next") return "अगले पृष्ठ पर जाएं";
      return "पिछले पृष्ठ पर जाएं";
    },
  },
};
