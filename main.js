// main.js
const { createApp, ref, computed, onMounted, watch } = Vue;
const { Layout, Menu, Input, Button, Breadcrumb, Switch: ASwitch } = antd; // Use ASwitch to avoid conflict with JS Switch

const App = {
  components: {
    'a-layout': Layout,
    'a-layout-header': Layout.Header,
    'a-layout-sider': Layout.Sider,
    'a-layout-content': Layout.Content,
    'a-menu': Menu,
    'a-menu-item': Menu.Item,
    'a-input-search': Input.Search,
    'a-textarea': Input.TextArea,
    'a-button': Button,
    'a-breadcrumb': Breadcrumb,
    'a-breadcrumb-item': Breadcrumb.Item,
    'a-switch': ASwitch,
  },
  setup() {
    // Placeholder for data properties
    const appTitle = ref('SAP Documentation Hub');
    const selectedDocId = ref(null);
    const docsData = ref([]);
    const isEditMode = ref(false);
    const searchTerm = ref(''); // For search bar
    const editingContent = ref(''); // Buffer for text area in edit mode

    const initialDocs = [
      { id: 'sap-overview', title: 'SAP Overview', content: '<h1>SAP Overview</h1><p>SAP is a leading provider of enterprise resource planning (ERP) software. Its solutions are widely used by companies of all sizes to manage business operations and customer relations.</p><p>Key benefits include improved data management, streamlined processes, and enhanced decision-making capabilities.</p>' },
      { id: 's4hana-intro', title: 'S/4HANA Introduction', content: '<h1>SAP S/4HANA</h1><p>SAP S/4HANA is the next-generation ERP suite built on the SAP HANA in-memory database. It offers a simplified data model, a modern user experience with SAP Fiori, and advanced analytics capabilities.</p><p>Core features include real-time processing, embedded AI, and integration with other SAP cloud solutions.</p>' },
      { id: 'key-modules', title: 'Key SAP Modules', content: '<h1>Key SAP Modules</h1><p>SAP ERP is composed of several core modules, each designed to manage specific business functions:</p><ul><li><b>FI (Financial Accounting):</b> Manages financial transactions, general ledger, accounts payable/receivable, and financial reporting.</li><li><b>CO (Controlling):</b> Focuses on cost management, profitability analysis, and internal orders.</li><li><b>SD (Sales and Distribution):</b> Handles sales processes, order management, shipping, and billing.</li><li><b>MM (Materials Management):</b> Manages procurement, inventory, and material valuation.</li><li><b>PP (Production Planning):</b> Oversees production processes, capacity planning, and material requirements planning.</li><li><b>HR (Human Resources)/HCM (Human Capital Management):</b> Manages payroll, personnel administration, talent management, and time recording.</li></ul>' }
    ];

    // Placeholder for computed properties
    const currentDocument = computed(() => {
      // Now directly returns the document object or null. Editing is handled by editingContent.
      if (!selectedDocId.value || docsData.value.length === 0) return null;
      return docsData.value.find(d => d.id === selectedDocId.value) || null;
    });

    // Placeholder for methods
    const selectDoc = (id) => {
      selectedDocId.value = id;
      // If in edit mode, also update editingContent for the new document
      // This is now handled by watch(selectedDocId, ...)
    };

    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value;
      // Logic for populating editingContent is now handled by watch(isEditMode, ...)
    };

    const internalSaveContent = () => {
      if (!selectedDocId.value || !currentDocument.value) {
        console.error('No document selected or current document is invalid.'); // Keep for error diagnosis
        return;
      }
      // console.log('Save content initiated for document:', selectedDocId.value); // For debugging
      const docIndex = docsData.value.findIndex(doc => doc.id === selectedDocId.value);
      if (docIndex !== -1) {
        // Create a new array for reactivity, with the updated document content
        const updatedDocs = [...docsData.value];
        updatedDocs[docIndex] = { ...updatedDocs[docIndex], content: editingContent.value };
        docsData.value = updatedDocs;
        // console.log('Document content updated in docsData for ID:', selectedDocId.value); // For debugging
      } else {
        console.error('Failed to find document in docsData for saving:', selectedDocId.value); // Keep for error diagnosis
      }
    };

    const internalOnSearch = (searchValue) => {
        // console.log('Search initiated with:', searchValue); // For debugging search functionality
        // Actual search logic will be implemented later
        // For now, it can filter docsData based on title (case-insensitive)
        if (!searchValue) {
            // If search is cleared, potentially reload original docs or handle as needed
            // This depends on how docsData is initially populated vs. filtered
            return;
        }
        // This is a simple filter example, might need more robust implementation
        docsData.value = docsData.value.filter(doc =>
            doc.title.toLowerCase().includes(searchValue.toLowerCase())
        );
    };


    // Placeholder for lifecycle hooks
    onMounted(() => {
      // console.log('Vue App Mounted'); // Redundant for production
      const storedDocs = localStorage.getItem('sapDocsContent');
      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          if (Array.isArray(parsedDocs) && parsedDocs.length > 0) {
            docsData.value = parsedDocs;
            // console.log('Loaded docsData from local storage.'); // For debugging
          } else {
            // console.log('Local storage data is empty or invalid, using initialDocs.'); // For debugging
            docsData.value = initialDocs;
          }
        } catch (e) {
          console.error('Failed to parse docsData from local storage, using initialDocs:', e); // Keep for error diagnosis
          docsData.value = initialDocs;
        }
      } else {
        // console.log('No docsData in local storage, using initialDocs.'); // For debugging
        docsData.value = initialDocs;
      }

      // Ensure a document is selected if possible
      if (!selectedDocId.value && docsData.value.length > 0) {
        const firstDocId = docsData.value[0].id;
        if (docsData.value.some(doc => doc.id === firstDocId)) {
             selectedDocId.value = firstDocId;
        } else if (docsData.value.length > 0) {
            selectedDocId.value = docsData.value[0].id;
        }
      } else if (selectedDocId.value && docsData.value.length > 0) {
        if (!docsData.value.some(doc => doc.id === selectedDocId.value)) {
            selectedDocId.value = docsData.value[0].id; 
        }
      } else if (docsData.value.length === 0) {
        selectedDocId.value = null;
      }

      // Check for URL parameter to enable edit mode
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('edit') === 'true') {
        isEditMode.value = true; // This will trigger the watch for isEditMode
      }
    });

    // Watch for changes in docsData and save to local storage
    watch(docsData, (newDocs) => {
      try {
        localStorage.setItem('sapDocsContent', JSON.stringify(newDocs));
        // console.log('docsData saved to local storage'); // For debugging
      } catch (e) {
        console.error('Failed to save docsData to local storage:', e); // Keep for error diagnosis
      }
    }, { deep: true });

    // Watch for changes in selectedDocId to update editingContent if in edit mode
    watch(selectedDocId, (newId, oldId) => {
      if (isEditMode.value && newId) {
        const doc = docsData.value.find(d => d.id === newId);
        if (doc) {
          editingContent.value = doc.content;
        } else {
          editingContent.value = ''; // Reset if new doc not found
        }
      }
    });
    
    // Watch for changes in isEditMode to populate editingContent
    watch(isEditMode, (newVal) => {
        if (newVal === true) { // Entering edit mode
            if (currentDocument.value) {
                editingContent.value = currentDocument.value.content;
            } else {
                editingContent.value = ''; // No document selected
            }
        }
        // No specific action needed when exiting edit mode regarding editingContent
    });

    const goHome = () => {
      selectedDocId.value = null;
      isEditMode.value = false; // Exit edit mode when going home
      // editingContent.value = ''; // Optionally clear editing content
    };

    return {
      appTitle,
      selectedDocId,
      docsData,
      isEditMode,
      editingContent, // Expose editingContent to the template
      searchTerm,
      currentDocument,
      selectDoc,
      toggleEditMode,
      saveContent: internalSaveContent, 
      onSearch: internalOnSearch,
      goHome, // Expose goHome to the template
    };
  },
  template: `
    <a-layout style="min-height: 100vh;">
      <a-layout-header class="header">
        <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
          <h1 style="color: white;">{{ appTitle }}</h1>
          <div>
            <a-input-search
              v-model:value="searchTerm"
              placeholder="Search docs..."
              style="width: 200px; margin-right: 16px;"
              @search="onSearch"
            />
            <span style="margin-right: 8px; color: white;">Edit Mode:</span>
            <a-switch v-model:checked="isEditMode" @change="toggleEditMode" />
          </div>
        </div>
      </a-layout-header>
      <a-layout class="app-layout">
        <a-layout-sider width="250" class="sidebar" theme="light">
          <a-menu
            v-model:selectedKeys="[selectedDocId]"
            mode="inline"
            @click="({ key }) => selectDoc(key)"
          >
            <a-menu-item v-if="docsData.length === 0" key="loading" disabled>
              Loading docs...
            </a-menu-item>
            <a-menu-item v-for="doc in docsData" :key="doc.id">
              {{ doc.title }}
            </a-menu-item>
          </a-menu>
        </a-layout-sider>
        <a-layout-content class="content-area">
          <!-- Breadcrumbs -->
          <a-breadcrumb style="margin-bottom: 16px;">
            <a-breadcrumb-item><a @click="goHome" style="cursor: pointer;">Home</a></a-breadcrumb-item>
            <a-breadcrumb-item v-if="currentDocument">{{ currentDocument.title }}</a-breadcrumb-item>
          </a-breadcrumb>

          <div v-if="currentDocument">
            <h2>{{ currentDocument.title }}</h2>
            <div v-if="!isEditMode" v-html="currentDocument.content"></div>
            <div v-if="isEditMode">
              <a-textarea
                v-model:value="editingContent"
                :rows="15"
                class="editor-textarea"
              />
              <a-button type="primary" @click="saveContent" style="margin-top: 10px;">
                Save Changes
              </a-button>
            </div>
          </div>
          <div v-else>
            <!-- Content to show when no document is selected (e.g., after clicking Home) -->
            <h2>Welcome to {{ appTitle }}</h2>
            <p>Select a document from the sidebar to view its content, or start by exploring our documentation.</p>
            <p v-if="docsData.length === 0">It seems there are no documents loaded. Check the console for errors or try refreshing.</p>
          </div>
        </a-layout-content>
      </a-layout>
    </a-layout>
  `
};

const app = createApp(App);

// Register Ant Design components globally (alternative to declaring in each component)
// app.use(antd); // This might be needed if components are not resolving

app.mount('#app');

// Global placeholder functions below are no longer needed as their logic
// has been integrated into the Vue app's setup context or are not used.
/*
function onSearch(searchValue) {
  // console.log('Global Search initiated with:', searchValue); // For debugging
  // This function is a placeholder and not directly wired into the Vue app's event handling.
  // The Vue app uses `internalOnSearch` from its `setup` context.
}

function saveContent() {
  // console.log('Global Save content initiated.'); // For debugging
  // This function is a placeholder and not directly wired into the Vue app's event handling.
  // The Vue app uses `internalSaveContent` from its `setup` context.
  // It would need access to `this.currentDocument` which is not available here.
}
*/
```
