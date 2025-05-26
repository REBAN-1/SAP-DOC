// main.js
const { createApp, ref, computed, onMounted, watch } = Vue;

const App = {
  setup() {
    // --- リアクティブなデータ ---
    const appTitle = ref('SAP総合学習ガイド');
    const docsData = ref([]); // { id: string, title: string, content: string }
    const selectedDocId = ref(null);
    const vueLoaded = ref(false); // index.htmlのローディングメッセージ制御用

    // --- 初期データは削除 ---
    // const initialDocs = [ ... ]; // この大きな配列定義を削除

    // --- ローカルストレージ関連 ---
    const STORAGE_KEY = 'sapDocsCustom';

    const saveDocs = () => {
      // docsData.valueが空の場合はローカルストレージをクリアするオプションも検討可能
      // if (docsData.value.length === 0) {
      //   localStorage.removeItem(STORAGE_KEY);
      // } else {
      //   localStorage.setItem(STORAGE_KEY, JSON.stringify(docsData.value));
      // }
      // 現状は、空でも保存（次回以降、空のローカルストレージとして扱われる）
      localStorage.setItem(STORAGE_KEY, JSON.stringify(docsData.value));
    };
    
    // docsDataが変更されたらローカルストレージに保存
    watch(docsData, saveDocs, { deep: true });


    const loadDocs = async () => {
      const storedDocs = localStorage.getItem(STORAGE_KEY);
      let useJsonFile = true; 

      if (storedDocs) {
        try {
          const parsedDocs = JSON.parse(storedDocs);
          if (Array.isArray(parsedDocs) && parsedDocs.length > 0 &&
              parsedDocs[0] && parsedDocs[0].id && parsedDocs[0].title && parsedDocs[0].content) {
            docsData.value = parsedDocs;
            useJsonFile = false; 
            console.log('ローカルストレージからドキュメントデータを読み込みました。');
          } else {
            console.log('ローカルストレージのデータは無効か空です。JSONファイルから読み込みます。');
            // ローカルストレージの内容が無効ならクリアする
            localStorage.removeItem(STORAGE_KEY);
          }
        } catch (e) {
          console.error('ローカルストレージのデータの解析に失敗しました。JSONファイルから読み込みます。', e);
          localStorage.removeItem(STORAGE_KEY); // パース失敗時もクリア
        }
      }

      if (useJsonFile) {
        try {
          console.log('sap-content.json からの読み込みを開始します...');
          const response = await fetch('./sap-content.json'); 
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          const jsonData = await response.json();
          if (Array.isArray(jsonData) && jsonData.length > 0) {
            docsData.value = jsonData; // これによりwatchがトリガーされsaveDocsが呼ばれる
            console.log('sap-content.json からドキュメントデータを読み込み、ローカルストレージに保存しました。');
            // JSONから読み込んだ直後にsaveDocsを明示的に呼ぶ必要はない（watchが処理するため）
            // ただし、docsData.valueへの代入がwatchトリガーに間に合わないケースを懸念するなら呼んでもよい。
            // 通常はリアクティビティシステムがこれを処理する。
          } else {
            console.warn('sap-content.json のデータ形式が不正か空です。');
            docsData.value = []; 
          }
        } catch (e) {
          console.error('sap-content.json の読み込みまたは解析に失敗しました:', e);
          docsData.value = []; 
        }
      }

      if (docsData.value.length > 0 && !selectedDocId.value) {
        selectedDocId.value = docsData.value[0].id;
      }
    };

    // --- 算出プロパティ ---
    const currentDocument = computed(() => {
      return docsData.value.find(doc => doc.id === selectedDocId.value) || null;
    });

    // --- メソッド ---
    const selectDoc = (id) => {
      selectedDocId.value = id;
    };

    const goHome = () => {
        selectedDocId.value = null;
    };

    // --- ライフサイクルフック ---
    onMounted(async () => { // onMountedをasyncにする
      await loadDocs(); // loadDocsの完了を待つ
      vueLoaded.value = true; // Vueの準備完了
    });
    
    // --- テンプレートに公開 ---
    return {
      appTitle,
      docsData,
      selectedDocId,
      currentDocument,
      selectDoc,
      goHome,
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
                <!-- Edit mode controls UI removed -->

                <div v-if="currentDocument">
                    <!-- Always display content, no edit mode toggle -->
                    <div v-html="currentDocument.content"></div>
                </div>
                <div v-else>
                    <h2>{{ appTitle }} へようこそ</h2>
                    <p>左のメニューからドキュメントを選択して表示します。</p>
                    <p v-if="docsData.length === 0">現在表示できるドキュメントがありません。コンテンツを読み込み中です。しばらく待っても表示されない場合は、ページを再読み込みするか、コンソールでエラーを確認してください。</p>
                </div>
            </main>
        </div>
    </div>
  `
};

createApp(App).mount('#app');
