export type NetworkConnection = {
  saveData?: boolean;
  effectiveType?: string;
  addEventListener?: (type: 'change', listener: () => void) => void;
  removeEventListener?: (type: 'change', listener: () => void) => void;
};

type NavigatorWithConnection = Navigator & {
  connection?: NetworkConnection;
  mozConnection?: NetworkConnection;
  webkitConnection?: NetworkConnection;
};

export function getNetworkConnection(): NetworkConnection | undefined {
  if (typeof navigator === 'undefined') return undefined;
  const value = navigator as NavigatorWithConnection;
  return value.connection ?? value.mozConnection ?? value.webkitConnection;
}

export function isConstrainedConnection(connection = getNetworkConnection()): boolean {
  if (!connection) return false;
  return Boolean(connection.saveData || connection.effectiveType === 'slow-2g' || connection.effectiveType === '2g');
}
