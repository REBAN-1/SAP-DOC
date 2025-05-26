// main.js
const { createApp, ref, computed, onMounted, watch } = Vue;

const App = {
  setup() {
    // --- リアクティブなデータ ---
    const appTitle = ref('SAP 解説ドキュメント');
    const docsData = ref([]); // { id: string, title: string, content: string }
    const selectedDocId = ref(null);
    const isEditMode = ref(false);
    const editingContent = ref(''); // <textarea> とバインドする編集中のコンテンツ
    const vueLoaded = ref(false); // index.htmlのローディングメッセージ制御用

    // --- 初期データ ---
    const initialDocs = [
      { id: 'sap-overview', title: 'SAPの概要', content: '<h1>SAPの概要</h1><p>SAPは、企業の業務効率化を支援する主要なERPソフトウェアプロバイダーです。...</p><ul><li>基幹業務システム</li><li>リアルタイムデータ処理</li></ul>' },
      { id: 's4hana-intro', title: 'SAP S/4HANAとは', content: '<h1>SAP S/4HANAとは</h1><p>SAP S/4HANAは、インメモリデータベースSAP HANAを基盤とした次世代のERPスイートです。...</p><p>主な特徴:</p><ol><li>インメモリコンピューティング</li><li>最新のUX (SAP Fiori)</li><li>クラウドおよびオンプレミス展開</li></ol>' },
      { id: 'sap-modules', title: '主要モジュール一覧', content: '<h1>主要モジュール一覧</h1><p>SAP ERPは多くのモジュールで構成されています。</p><ul><li><strong>FI:</strong> 財務会計</li><li><strong>CO:</strong> 管理会計</li><li><strong>SD:</strong> 販売管理</li><li><strong>MM:</strong> 在庫購買管理</li><li><strong>PP:</strong> 生産計画/管理</li><li><strong>HR/HCM:</strong> 人事管理</li></ul>' }
    ];

    // --- ローカルストレージ関連 ---
    const STORAGE_KEY = 'sapDocsCustom';

    const loadDocs = () => {
      const storedDocs = localStorage.getItem(STORAGE_KEY);
      if (storedDocs) {
        try {
          docsData.value = JSON.parse(storedDocs);
        } catch (e) {
          console.error('ローカルストレージのデータの解析に失敗しました:', e);
          docsData.value = [...initialDocs]; // パース失敗時は初期データ
        }
      } else {
        docsData.value = [...initialDocs];
      }
      // デフォルトで最初のドキュメントを選択 (もしあれば)
      if (docsData.value.length > 0 && !selectedDocId.value) {
        selectedDocId.value = docsData.value[0].id;
      }
    };

    const saveDocs = () => {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docsData.value));
    };

    // docsDataが変更されたらローカルストレージに保存
    watch(docsData, saveDocs, { deep: true });

    // --- 算出プロパティ ---
    const currentDocument = computed(() => {
      return docsData.value.find(doc => doc.id === selectedDocId.value) || null;
    });

    // --- メソッド ---
    const selectDoc = (id) => {
      selectedDocId.value = id;
      // The watcher for [isEditMode, currentDocument] handles editingContent update.
      // if (isEditMode.value && currentDocument.value) { 
      //   editingContent.value = currentDocument.value.content; 
      // }
    };

    const goHome = () => {
        selectedDocId.value = null;
        isEditMode.value = false; // ホーム表示時は編集モード解除
    };

    const toggleEditMode = () => {
      isEditMode.value = !isEditMode.value;
      // The watcher for [isEditMode, currentDocument] handles editingContent update.
      // if (isEditMode.value && currentDocument.value) {
      //   editingContent.value = currentDocument.value.content; 
      // } else if (!isEditMode.value) {
      // }
    };

    const saveContentChanges = () => {
      if (currentDocument.value) {
        const docIndex = docsData.value.findIndex(doc => doc.id === currentDocument.value.id);
        if (docIndex !== -1) {
          const updatedDoc = { ...docsData.value[docIndex], content: editingContent.value };
          const newDocsData = [...docsData.value];
          newDocsData[docIndex] = updatedDoc;
          docsData.value = newDocsData; // This triggers the watch for docsData to save to localStorage
          // isEditMode.value = false; // Optionally exit edit mode after save
          alert('コンテンツが保存されました！');
        }
      }
    };
    
    const checkUrlParams = () => {
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('edit') === 'true') {
            isEditMode.value = true; // This will trigger the watcher for isEditMode
        }
    };

    // --- ライフサイクルフック ---
    onMounted(() => {
      loadDocs();
      checkUrlParams(); 
      // Initial population of editingContent if starting in edit mode is handled by the watcher.
      vueLoaded.value = true; // Vueの準備完了
    });
    
    // Watch for changes in isEditMode or currentDocument to update editingContent
    watch([isEditMode, currentDocument], ([newEditMode, newDoc], [oldEditMode, oldDoc]) => {
        if (newEditMode && newDoc) {
            // Entering edit mode OR changing doc while in edit mode
            // Update editingContent if the document changed or if we just entered edit mode for the current doc
            if (newDoc.id !== oldDoc?.id || (newEditMode && !oldEditMode)) {
                 editingContent.value = newDoc.content;
            }
        } else if (!newEditMode && oldEditMode) {
            // Exiting edit mode
            // Optionally clear editingContent or handle unsaved changes confirmation here
            // For example: editingContent.value = ''; 
        }
    }, { immediate: false }); // immediate: false to avoid running on initial mount before docs are loaded

    // --- テンプレートに公開 ---
    return {
      appTitle,
      docsData,
      selectedDocId,
      isEditMode,
      editingContent,
      currentDocument,
      selectDoc,
      goHome,
      toggleEditMode,
      saveContentChanges,
      vueLoaded
    };
  },
  // HTMLテンプレート (style.cssで定義したクラス名を使用)
  template: `
    <div v-if="vueLoaded" style="display: flex; flex-direction: column; height: 100%;">
        <header class="app-header">
            <h1>{{ appTitle }}</h1>
        </header>

        <div class="app-main-layout">
            <aside class="app-sidebar">
                <h2>目次</h2>
                <ul>
                    <li><a href="#" @click.prevent="goHome" :class="{ active: !selectedDocId }">ホーム</a></li>
                    <li v-for="doc in docsData" :key="doc.id">
                        <a href="#" @click.prevent="selectDoc(doc.id)" :class="{ active: doc.id === selectedDocId }">
                            {{ doc.title }}
                        </a>
                    </li>
                </ul>
            </aside>

            <main class="app-content">
                <div class="edit-mode-controls" v-if="docsData.length > 0 && selectedDocId">
                    <!-- Show controls only if there's a document selected -->
                    <span class="toggle-switch-label">編集モード:</span>
                    <label class="switch">
                        <!-- Use v-model directly on isEditMode. The watcher handles the logic. -->
                        <input type="checkbox" v-model="isEditMode">
                        <span class="slider"></span>
                    </label>
                </div>

                <div v-if="currentDocument">
                    <div v-if="!isEditMode" v-html="currentDocument.content"></div>
                    <div v-if="isEditMode">
                        <textarea v-model="editingContent" class="editor-textarea"></textarea>
                        <button @click="saveContentChanges" class="save-button">変更を保存</button>
                    </div>
                </div>
                <div v-else>
                    <h2>{{ appTitle }} へようこそ</h2>
                    <p>左のメニューからドキュメントを選択して表示します。</p>
                    <p v-if="docsData.length === 0">現在表示できるドキュメントがありません。</p>
                </div>
            </main>
        </div>
    </div>
  `
};

createApp(App).mount('#app');
