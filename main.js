// main.js
const { createApp, ref, computed, onMounted, watch } = Vue;

const App = {
  setup() {
    // --- リアクティブなデータ ---
    const appTitle = ref('Vue.js ガイド風ドキュメント'); // Title updated
    const docsData = ref([]); // { id: string, title: string, content: string }
    const selectedDocId = ref(null);
    // isEditMode ref was here
    // editingContent ref was here
    const vueLoaded = ref(false); // index.htmlのローディングメッセージ制御用

    // --- 初期データ ---
    const initialDocs = [
      // はじめに
      { id: 'introduction', title: 'はじめに', content: '<h1>はじめに</h1><p>Vue.js へようこそ。これはプログレッシブフレームワークについての説明です。</p>' },
      { id: 'quick-start', title: 'クイックスタート', content: '<h1>クイックスタート</h1><p>Vue.js を素早く始めるためのガイドです。CDNまたはビルドツールを使用します。</p><h2>CDNからの利用</h2><p><code>&lt;script&gt;</code>タグでVueを読み込むことができます。</p><h2>プロジェクト作成</h2><p><code>npm create vue@latest</code> を使用してプロジェクトをセットアップします。</p>' },
      // 基礎
      { id: 'essentials-create-app', title: 'アプリケーションの作成', content: '<h1>アプリケーションの作成</h1><p>すべての Vue アプリケーションは、<code>createApp</code> 関数で新しいアプリケーションインスタンスを作成することから始まります。</p><p><code>const app = Vue.createApp({})</code></p>' },
      { id: 'essentials-template-syntax', title: 'テンプレート構文', content: '<h1>テンプレート構文</h1><p>Vue は HTML ベースのテンプレート構文を使用します。データバインディングの基本は Mustache 構文 (二重中括弧) です: <code>{{ message }}</code></p><h2>属性バインディング</h2><p><code>v-bind:attributeName</code> または省略形 <code>:attributeName</code> を使用します。</p>' },
      { id: 'essentials-reactivity', title: 'リアクティビティの基礎', content: '<h1>リアクティビティの基礎</h1><p>Vue のリアクティビティシステムについて。<code>ref()</code> や <code>reactive()</code> を使用してリアクティブなデータを作成します。</p>' },
      { id: 'essentials-computed', title: '算出プロパティ', content: '<h1>算出プロパティ</h1><p>テンプレート内で複雑なロジックを記述する代わりに算出プロパティを使用します。依存関係に基づいてキャッシュされます。</p><p>例: <code>const publishedBooksMessage = computed(() => { return author.books.length > 0 ? \'Yes\' : \'No\' })</code></p>' },
      { id: 'essentials-class-style', title: 'クラスとスタイルのバインディング', content: '<h1>クラスとスタイルのバインディング</h1><p><code>v-bind:class</code> (または <code>:class</code>) と <code>v-bind:style</code> (または <code>:style</code>) を使用して、HTML 要素のクラスやインラインスタイルを動的に操作します。</p>' },
      { id: 'essentials-conditional', title: '条件付きレンダリング', content: '<h1>条件付きレンダリング</h1><p><code>v-if</code>, <code>v-else-if</code>, <code>v-else</code> ディレクティブを使用して、条件に基づいてブロックをレンダリングします。<code>v-show</code> も利用可能です。</p>' },
      { id: 'essentials-list', title: 'リストレンダリング', content: '<h1>リストレンダリング</h1><p><code>v-for</code> ディレクティブを使用して、配列に基づいてアイテムのリストをレンダリングします。</p><p>例: <code>&lt;li v-for="item in items" :key="item.id"&gt;{{ item.text }}&lt;/li&gt;</code></p>' },
      { id: 'essentials-event-handling', title: 'イベントハンドリング', content: '<h1>イベントハンドリング</h1><p><code>v-on</code> ディレクティブ (または <code>@</code>) を使用して DOM イベントをリッスンし、イベント発生時に JavaScript を実行します。</p><p>例: <code>&lt;button @click="counter++"&gt;Add 1&lt;/button&gt;</code></p>' },
      { id: 'essentials-form-input', title: 'フォーム入力バインディング', content: '<h1>フォーム入力バインディング</h1><p><code>v-model</code> ディレクティブを使用して、フォームの input, textarea, select 要素に双方向データバインディングを作成します。</p>' },
      { id: 'essentials-lifecycle-hooks', title: 'ライフサイクルフック', content: '<h1>ライフサイクルフック</h1><p>コンポーネントのライフサイクルの特定の段階で実行される関数です。例: <code>onMounted</code>, <code>onUpdated</code>, <code>onUnmounted</code>。</p>' },
      // コンポーネント
      { id: 'components-basics', title: 'コンポーネントの基本', content: '<h1>コンポーネントの基本</h1><p>コンポーネントは再利用可能な Vue インスタンスです。独自のカスタム要素として使用できます。</p>' },
      { id: 'components-props', title: 'Props', content: '<h1>Props</h1><p>Props は親コンポーネントから子コンポーネントにデータを渡すためのカスタム属性です。</p>' },
      { id: 'components-events', title: 'イベント ($emit)', content: '<h1>イベント ($emit)</h1><p>子コンポーネントが親コンポーネントと通信するための手段です。<code>$emit</code> を使用してカスタムイベントを発行します。</p>' },
      // { id: 'components-slots', title: 'スロット', content: '<h1>スロット</h1><p>親コンポーネントから子コンポーネントにテンプレートの断片を渡すための仕組みです。</p>' },
      // その他 (余裕があれば)
      // { id: 'composition-api-intro', title: 'コンポジションAPIとは', content: '<h1>コンポジションAPIとは</h1><p>より柔軟で再利用可能なロジックを作成するためのAPIセットです。</p>' },
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
      // Edit mode related logic removed
    };

    const goHome = () => {
        selectedDocId.value = null;
        // Edit mode related logic removed (isEditMode.value = false;)
    };

    // toggleEditMode method removed
    // saveContentChanges method removed
    // checkUrlParams method removed (as it only handled edit mode)

    // --- ライフサイクルフック ---
    onMounted(() => {
      loadDocs();
      // checkUrlParams call removed
      vueLoaded.value = true; // Vueの準備完了
    });
    
    // Watcher for [isEditMode, currentDocument] removed

    // --- テンプレートに公開 ---
    return {
      appTitle,
      docsData,
      selectedDocId,
      // isEditMode removed from return
      // editingContent removed from return
      currentDocument,
      selectDoc,
      goHome,
      // toggleEditMode removed from return
      // saveContentChanges removed from return
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
                    <p v-if="docsData.length === 0">現在表示できるドキュメントがありません。</p>
                </div>
            </main>
        </div>
    </div>
  `
};

createApp(App).mount('#app');
