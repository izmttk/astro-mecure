import { useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useDocSearchKeyboardEvents, DocSearchModal } from '@docsearch/react';
import '@docsearch/css';
import './Search.css';
import { useAtom } from 'jotai';
import { searchModelOpen as searchModelOpenAtom } from '@/store/atoms';

const defaultTranslations = {
  searchBox: {
    resetButtonTitle: '清空输入',
    resetButtonAriaLabel: '清空输入',
    cancelButtonText: '取消',
    cancelButtonAriaLabel: '取消',
  },
  startScreen: {
    recentSearchesTitle: '最近搜索',
    noRecentSearchesText: '没有最近搜索',
    saveRecentSearchButtonTitle: '添加收藏',
    removeRecentSearchButtonTitle: '删除记录',
    favoriteSearchesTitle: '收藏',
    removeFavoriteSearchButtonTitle: '删除收藏',
  },
  errorScreen: {
    titleText: '无法获取搜索结果',
    helpText: '请检查网络连接是否有效',
  },
  footer: {
    selectText: '选中',
    selectKeyAriaLabel: 'Enter key',
    navigateText: '移动光标',
    navigateUpKeyAriaLabel: 'Arrow up',
    navigateDownKeyAriaLabel: 'Arrow down',
    closeText: '退出',
    closeKeyAriaLabel: 'Escape key',
    searchByText: 'Search by',
  },
  noResultsScreen: {
    noResultsText: '未找到结果: ',
    suggestedQueryText: '请尝试搜索',
    reportMissingResultsText: '确定应该有搜索结果?',
    reportMissingResultsLinkText: '请给我们反馈.',
  },
};

export interface SearchProps {
  appId: string;
  apiKey: string;
  indexName: string;
}

export default function Search({
  appId,
  apiKey,
  indexName,
}: SearchProps) {
  const [searchModalOpen, setSearchModalOpen] = useAtom(searchModelOpenAtom);

  const onOpen = useCallback(() => {
    setSearchModalOpen(true);
  }, []);

  const onClose = useCallback(() => {
    setSearchModalOpen(false);
  }, []);

  useDocSearchKeyboardEvents({
    isOpen: searchModalOpen,
    onOpen,
    onClose,
  });
  
  return (
    <>
      {searchModalOpen && createPortal(
        <DocSearchModal
          appId={appId}
          apiKey={apiKey}
          indexName={indexName}
          placeholder='请输入搜索文本...'
          translations={defaultTranslations}
          initialScrollY={window.scrollY}
          onClose={onClose}
        />,
        document.body,
      )}
    </>
  )
}

