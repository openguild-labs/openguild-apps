import { WalletAccount, Wallet, getWallets } from '@talismn/connect-wallets';
import { cloneElement, ReactElement, ReactNode, useCallback, useEffect, useState } from 'react';
import styles from './WalletSelect.module.css';
import { WalletList } from './WalletList';
import { AccountList } from './AccountList';
import { InstallExtension } from './InstallExtension';
import { NoAccounts } from './NoAccounts';
import { Loading } from './Loading';
import Modal from '../Modal';
import { CloseOutlined } from '@ant-design/icons';
import { MIDDLE_STYLE } from '@/constants';
import { saveAndDispatchWalletSelect } from '@/utils/web3-wallet';

export interface WalletSelectProps {
  dappName: string;
  open?: boolean;

  onWalletConnectOpen?: (wallets: Wallet[]) => unknown;
  onWalletConnectClose?: () => unknown;
  onWalletSelected?: (wallet: Wallet) => unknown;
  onUpdatedAccounts?: (accounts: WalletAccount[] | undefined) => unknown;
  onAccountSelected?: (account: WalletAccount) => unknown;
  onError?: (error?: unknown) => unknown;
  triggerComponent?: ReactElement;

  walletList?: Wallet[];

  onlyShowInstalled?: boolean;
  makeInstallable?: boolean;

  // If `showAccountsList` is specified, then account selection modal will show up.
  showAccountsList?: boolean;
  header?: ReactNode;
}

export function WalletSelect(props: WalletSelectProps) {
  const {
    onWalletConnectOpen,
    onWalletConnectClose,
    onWalletSelected,
    onUpdatedAccounts,
    onAccountSelected,
    onError,
    triggerComponent,
    showAccountsList,
    header,
    dappName,
    walletList,
    onlyShowInstalled,
    makeInstallable,
    open = false,
  } = props;

  const [error, setError] = useState<Error>();
  const [supportedWallets, setWallets] = useState<Wallet[]>();
  const [selectedWallet, setSelectedWallet] = useState<Wallet>();
  const [accounts, setAccounts] = useState<WalletAccount[] | undefined>();
  const [loadingAccounts, setLoadingAccounts] = useState<boolean | undefined>();
  const [unsubscribe, setUnsubscribe] = useState<Record<string, () => unknown>>();

  const [isOpen, setIsOpen] = useState(false);

  const onModalOpen = useCallback(() => {
    const wallets = getWallets();
    const installedWallets = wallets.filter(wallet => wallet.installed);
    const updatedWalletList = onlyShowInstalled ? installedWallets : walletList;
    setWallets(updatedWalletList || wallets);
    setIsOpen(true);
    setLoadingAccounts(false);
    if (onWalletConnectOpen) {
      onWalletConnectOpen(wallets);
    }
    return wallets;
  }, [onWalletConnectOpen]);

  const onModalClose = useCallback(() => {
    setIsOpen(false);
    setSelectedWallet(undefined);
    setError(undefined);
    setLoadingAccounts(false);
    if (onWalletConnectClose) {
      onWalletConnectClose();
    }
  }, [onWalletConnectClose]);

  useEffect(() => {
    return () => {
      if (unsubscribe) {
        Object.values(unsubscribe).forEach(unsubscribeFn => {
          unsubscribeFn?.();
        });
      }
    };
  });

  useEffect(() => {
    if (open) {
      onModalOpen();
    }
  }, [onModalOpen, open]);

  useEffect(() => {
    if (!selectedWallet) {
      setError(undefined);
    }
  }, [selectedWallet]);

  useEffect(() => {
    if (onError) {
      onError(error || undefined);
    }
  }, [error, onError]);

  const onWalletListSelected = useCallback(
    async (wallet: Wallet) => {
      setError(undefined);
      setSelectedWallet(wallet);

      try {
        setLoadingAccounts(true);
        await wallet.enable(dappName);

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const unsub: any = await wallet.subscribeAccounts(accounts => {
          setLoadingAccounts(false);
          setAccounts(accounts);
          if (onUpdatedAccounts) {
            onUpdatedAccounts(accounts);
          }
        });

        setUnsubscribe({
          [wallet.extensionName]: unsub,
        });

        if (wallet.installed) {
          saveAndDispatchWalletSelect(wallet);
        }

        if (!showAccountsList && wallet.installed) {
          onModalClose();
        }
      } catch (err) {
        setError(err as Error);
        setLoadingAccounts(false);
        onError?.(err);
      }

      if (onWalletSelected) {
        onWalletSelected(wallet);
      }
    },
    [dappName, onError, onModalClose, onUpdatedAccounts, onWalletSelected, showAccountsList]
  );

  const installedTitle = error
    ? `${selectedWallet?.title} error`
    : `Select ${selectedWallet?.title} account`;

  const uninstalledTitle = loadingAccounts ? `Loading...` : `Haven't got a wallet yet?`;

  const accountsSelectionTitle = selectedWallet?.installed ? installedTitle : uninstalledTitle;

  const defaultTitle = header || 'Connect wallet';
  const modalTitle = !selectedWallet ? defaultTitle : accountsSelectionTitle;

  const selectedWalletAccounts = accounts?.filter(
    account => account.source === selectedWallet?.extensionName
  );

  const hasLoaded = loadingAccounts === false;
  const hasAccounts =
    hasLoaded &&
    selectedWallet?.installed &&
    selectedWalletAccounts &&
    selectedWalletAccounts?.length > 0;

  return (
    <>
      {triggerComponent &&
        cloneElement(triggerComponent, {
          onClick: (e: Event) => {
            e.stopPropagation();
            const wallets = onModalOpen();
            triggerComponent.props.onClick?.(wallets);
          },
        })}
      <Modal
        variant="custom"
        className="max-w-md bg-white"
        title={modalTitle}
        onCancel={onModalClose}
        isActive={isOpen}>
        <div className="text-center p-2">
          <div style={{ ...MIDDLE_STYLE, justifyContent: 'space-between' }}>
            <h1 className="text-black text-lg font-semibold">Connect to Web3 wallet</h1>
            <CloseOutlined onClick={onModalClose} />
          </div>
          {!selectedWallet && (
            <WalletList
              items={supportedWallets}
              onClick={onWalletListSelected}
              makeInstallable={makeInstallable}
            />
          )}
          {selectedWallet && loadingAccounts && <Loading />}
          {selectedWallet && !selectedWallet?.installed && loadingAccounts === false && (
            <InstallExtension wallet={selectedWallet} />
          )}
          {selectedWallet &&
            selectedWallet?.installed &&
            showAccountsList &&
            loadingAccounts === false && (
              <>
                {!hasAccounts && <NoAccounts wallet={selectedWallet} />}
                {hasAccounts && (
                  <AccountList
                    items={selectedWalletAccounts}
                    onClick={account => {
                      if (onAccountSelected) {
                        onAccountSelected(account);
                      }
                      onModalClose();
                    }}
                  />
                )}
              </>
            )}
          {error && <div className={styles['message']}>{error.message}</div>}
        </div>
      </Modal>
    </>
  );
}

export default WalletSelect;
