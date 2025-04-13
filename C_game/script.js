// 将棋ゲームの実装

// 駒の種類と表示文字の定義
const PIECES = {
    OU: '王', // 王将（玉将）
    HI: '飛', // 飛車
    KAKU: '角', // 角行
    KIN: '金', // 金将
    GIN: '銀', // 銀将
    KEI: '桂', // 桂馬
    KYO: '香', // 香車
    FU: '歩', // 歩兵
    RYU: '龍', // 龍王（成飛車）
    UMA: '馬', // 龍馬（成角行）
    NGIN: '全', // 成銀
    NKEI: '圭', // 成桂
    NKYO: '杏', // 成香
    TO: 'と'  // と金（成歩兵）
};

// ゲームの状態
const gameState = {
    board: [], // 盤面の状態
    selectedCell: null, // 選択されたセルの位置
    currentPlayer: 'black', // 現在の手番（black/white）
    possibleMoves: [], // 選択した駒の移動可能な位置
    capturedPieces: { // 持ち駒
        black: [],
        white: []
    },
    isGameOver: false, // ゲーム終了フラグ
    winner: null, // 勝者
    isPromoting: false, // 成り判定中かどうか
    selectedForDrop: null // 打ち駒選択状態
};

// 初期盤面の設定
function initializeBoard() {
    // 9x9の空の盤面を作成
    const board = Array(9).fill().map(() => Array(9).fill(null));
    
    // 駒の初期配置（インデックスは0始まり）
    
    // 後手（白）の配置
    board[0][0] = { type: PIECES.KYO, player: 'white', promoted: false };
    board[0][1] = { type: PIECES.KEI, player: 'white', promoted: false };
    board[0][2] = { type: PIECES.GIN, player: 'white', promoted: false };
    board[0][3] = { type: PIECES.KIN, player: 'white', promoted: false };
    board[0][4] = { type: PIECES.OU, player: 'white', promoted: false };
    board[0][5] = { type: PIECES.KIN, player: 'white', promoted: false };
    board[0][6] = { type: PIECES.GIN, player: 'white', promoted: false };
    board[0][7] = { type: PIECES.KEI, player: 'white', promoted: false };
    board[0][8] = { type: PIECES.KYO, player: 'white', promoted: false };
    
    board[1][1] = { type: PIECES.KAKU, player: 'white', promoted: false };
    board[1][7] = { type: PIECES.HI, player: 'white', promoted: false };
    
    for (let i = 0; i < 9; i++) {
        board[2][i] = { type: PIECES.FU, player: 'white', promoted: false };
    }
    
    // 先手（黒）の配置
    board[8][0] = { type: PIECES.KYO, player: 'black', promoted: false };
    board[8][1] = { type: PIECES.KEI, player: 'black', promoted: false };
    board[8][2] = { type: PIECES.GIN, player: 'black', promoted: false };
    board[8][3] = { type: PIECES.KIN, player: 'black', promoted: false };
    board[8][4] = { type: PIECES.OU, player: 'black', promoted: false };
    board[8][5] = { type: PIECES.KIN, player: 'black', promoted: false };
    board[8][6] = { type: PIECES.GIN, player: 'black', promoted: false };
    board[8][7] = { type: PIECES.KEI, player: 'black', promoted: false };
    board[8][8] = { type: PIECES.KYO, player: 'black', promoted: false };
    
    board[7][1] = { type: PIECES.HI, player: 'black', promoted: false };
    board[7][7] = { type: PIECES.KAKU, player: 'black', promoted: false };
    
    for (let i = 0; i < 9; i++) {
        board[6][i] = { type: PIECES.FU, player: 'black', promoted: false };
    }
    
    return board; // 初期盤面を返す
}

// 駒の移動可能な位置を取得する関数
function getPossibleMoves(row, col, piece, board) {
    const moves = []; // 移動可能な位置を格納する配列
    
    // 既に成っている駒や元々金の動きをする駒（金、成駒）
    if (piece.type === PIECES.KIN || piece.type === PIECES.TO || 
        piece.type === PIECES.NGIN || piece.type === PIECES.NKEI || piece.type === PIECES.NKYO) {
        return getGoldMoves(row, col, piece.player, board); // 金の動き
    }
    
    // 王将の動き（8方向に1マス）
    if (piece.type === PIECES.OU) {
        return getKingMoves(row, col, piece.player, board); // 王将の動き
    }
    
    // 飛車の動き（上下左右に何マスでも）
    if (piece.type === PIECES.HI) {
        return getRookMoves(row, col, piece.player, board); // 飛車の動き
    }
    
    // 角行の動き（斜め方向に何マスでも）
    if (piece.type === PIECES.KAKU) {
        return getBishopMoves(row, col, piece.player, board); // 角行の動き
    }
    
    // 龍王（成飛車）の動き（飛車+斜め1マス）
    if (piece.type === PIECES.RYU) {
        return [...getRookMoves(row, col, piece.player, board), ...getDragonKingExtraMoves(row, col, piece.player, board)]; // 龍王の動き
    }
    
    // 龍馬（成角）の動き（角行+上下左右1マス）
    if (piece.type === PIECES.UMA) {
        return [...getBishopMoves(row, col, piece.player, board), ...getDragonHorseExtraMoves(row, col, piece.player, board)]; // 龍馬の動き
    }
    
    // 銀将の動き
    if (piece.type === PIECES.GIN) {
        return getSilverMoves(row, col, piece.player, board); // 銀将の動き
    }
    
    // 桂馬の動き
    if (piece.type === PIECES.KEI) {
        return getKnightMoves(row, col, piece.player, board); // 桂馬の動き
    }
    
    // 香車の動き
    if (piece.type === PIECES.KYO) {
        return getLanceMoves(row, col, piece.player, board); // 香車の動き
    }
    
    // 歩兵の動き
    if (piece.type === PIECES.FU) {
        return getPawnMoves(row, col, piece.player, board); // 歩兵の動き
    }
    
    return moves; // 移動可能な位置を返す
}

// 王将の動き
function getKingMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    const directions = [
        [-1, -1], [-1, 0], [-1, 1], // 上左、上、上右
        [0, -1],           [0, 1], // 左、右
        [1, -1],  [1, 0],  [1, 1] // 下左、下、下右
    ];
    
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow; // 新しい行
        const newCol = col + dCol; // 新しい列
        
        if (isValidPosition(newRow, newCol) && !isOccupiedByAlly(newRow, newCol, player, board)) {
            moves.push([newRow, newCol]); // 移動可能な位置を追加
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 金将の動き
function getGoldMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    let directions; // 移動方向を格納する変数
    
    if (player === 'black') {
        directions = [
            [-1, -1], [-1, 0], [-1, 1], // 上左、上、上右
            [0, -1],           [0, 1], // 左、右
            [1, 0] // 下
        ];
    } else { // white
        directions = [
            [-1, 0], // 上
            [0, -1],           [0, 1], // 左、右
            [1, -1],  [1, 0],  [1, 1] // 下左、下、下右
        ];
    }
    
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow; // 新しい行
        const newCol = col + dCol; // 新しい列
        
        if (isValidPosition(newRow, newCol) && !isOccupiedByAlly(newRow, newCol, player, board)) {
            moves.push([newRow, newCol]); // 移動可能な位置を追加
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 銀将の動き
function getSilverMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    let directions; // 移動方向を格納する変数
    
    if (player === 'black') {
        directions = [
            [-1, -1], [-1, 0], [-1, 1], // 上左、上、上右
            [1, -1],           [1, 1] // 下左、下右
        ];
    } else { // white
        directions = [
            [-1, -1],           [-1, 1], // 上左、上右
            [1, -1],  [1, 0],  [1, 1] // 下左、下、下右
        ];
    }
    
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow; // 新しい行
        const newCol = col + dCol; // 新しい列
        
        if (isValidPosition(newRow, newCol) && !isOccupiedByAlly(newRow, newCol, player, board)) {
            moves.push([newRow, newCol]); // 移動可能な位置を追加
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 桂馬の動き（2前・1横）
function getKnightMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    let offsets; // 移動オフセットを格納する変数
    
    if (player === 'black') {
        offsets = [[-2, -1], [-2, 1]]; // 上方向に2マス進んで左右に1マス
    } else { // white
        offsets = [[2, -1], [2, 1]]; // 下方向に2マス進んで左右に1マス
    }
    
    for (const [dRow, dCol] of offsets) {
        const newRow = row + dRow; // 新しい行
        const newCol = col + dCol; // 新しい列
        
        if (isValidPosition(newRow, newCol) && !isOccupiedByAlly(newRow, newCol, player, board)) {
            moves.push([newRow, newCol]); // 移動可能な位置を追加
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 香車の動き（前方向に何マスでも）
function getLanceMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    let direction; // 移動方向を格納する変数
    
    if (player === 'black') {
        direction = -1; // 上方向
    } else { // white
        direction = 1;  // 下方向
    }
    
    let currentRow = row + direction; // 現在の行を更新
    
    while (isValidPosition(currentRow, col)) { // 盤面内である限り
        if (board[currentRow][col] === null) {
            moves.push([currentRow, col]); // 空いているマスを追加
        } else if (board[currentRow][col].player !== player) {
            // 敵の駒があれば、その位置は移動可能だが、それ以上進めない
            moves.push([currentRow, col]);
            break; // それ以上進まない
        } else {
            // 味方の駒があれば、それ以上進めない
            break; // それ以上進まない
        }
        currentRow += direction; // 次の行に進む
    }
    
    return moves; // 移動可能な位置を返す
}

// 歩兵の動き（前方向に1マス）
function getPawnMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    let direction; // 移動方向を格納する変数
    
    if (player === 'black') {
        direction = -1; // 上方向
    } else { // white
        direction = 1;  // 下方向
    }
    
    const newRow = row + direction; // 新しい行を計算
    
    if (isValidPosition(newRow, col) && !isOccupiedByAlly(newRow, col, player, board)) {
        moves.push([newRow, col]); // 移動可能な位置を追加
    }
    
    return moves; // 移動可能な位置を返す
}

// 飛車の動き（上下左右に何マスでも）
function getRookMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    const directions = [[-1, 0], [0, -1], [0, 1], [1, 0]]; // 上、左、右、下
    
    for (const [dRow, dCol] of directions) {
        let currentRow = row + dRow; // 新しい行
        let currentCol = col + dCol; // 新しい列
        
        while (isValidPosition(currentRow, currentCol)) { // 盤面内である限り
            if (board[currentRow][currentCol] === null) {
                moves.push([currentRow, currentCol]); // 空いているマスを追加
            } else if (board[currentRow][currentCol].player !== player) {
                // 敵の駒があれば、その位置は移動可能だが、それ以上進めない
                moves.push([currentRow, currentCol]);
                break; // それ以上進まない
            } else {
                // 味方の駒があれば、それ以上進めない
                break; // それ以上進まない
            }
            currentRow += dRow; // 次の行に進む
            currentCol += dCol; // 次の列に進む
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 角行の動き（斜め方向に何マスでも）
function getBishopMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // 左上、右上、左下、右下
    
    for (const [dRow, dCol] of directions) {
        let currentRow = row + dRow; // 新しい行
        let currentCol = col + dCol; // 新しい列
        
        while (isValidPosition(currentRow, currentCol)) { // 盤面内である限り
            if (board[currentRow][currentCol] === null) {
                moves.push([currentRow, currentCol]); // 空いているマスを追加
            } else if (board[currentRow][currentCol].player !== player) {
                // 敵の駒があれば、その位置は移動可能だが、それ以上進めない
                moves.push([currentRow, currentCol]);
                break; // それ以上進まない
            } else {
                // 味方の駒があれば、それ以上進めない
                break; // それ以上進まない
            }
            currentRow += dRow; // 次の行に進む
            currentCol += dCol; // 次の列に進む
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 龍王（成飛車）の追加の動き（斜め1マス）
function getDragonKingExtraMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    const directions = [[-1, -1], [-1, 1], [1, -1], [1, 1]]; // 斜め方向
    
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow; // 新しい行
        const newCol = col + dCol; // 新しい列
        
        if (isValidPosition(newRow, newCol) && !isOccupiedByAlly(newRow, newCol, player, board)) {
            moves.push([newRow, newCol]); // 移動可能な位置を追加
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 龍馬（成角）の追加の動き（上下左右1マス）
function getDragonHorseExtraMoves(row, col, player, board) {
    const moves = []; // 移動可能な位置を格納する配列
    const directions = [[-1, 0], [0, -1], [0, 1], [1, 0]]; // 上下左右
    
    for (const [dRow, dCol] of directions) {
        const newRow = row + dRow; // 新しい行
        const newCol = col + dCol; // 新しい列
        
        if (isValidPosition(newRow, newCol) && !isOccupiedByAlly(newRow, newCol, player, board)) {
            moves.push([newRow, newCol]); // 移動可能な位置を追加
        }
    }
    
    return moves; // 移動可能な位置を返す
}

// 座標が盤面内かチェック
function isValidPosition(row, col) {
    return row >= 0 && row < 9 && col >= 0 && col < 9; // 行と列が有効な範囲内かをチェック
}

// 指定位置に味方の駒があるかチェック
function isOccupiedByAlly(row, col, player, board) {
    return board[row][col] !== null && board[row][col].player === player; // 指定位置に味方の駒があるかをチェック
}

// 駒が成れるかチェック
function canPromote(piece, fromRow, toRow) {
    if (piece.promoted) return false; // 既に成っている場合は成れない
    
    // 成れない駒（王将、金将）
    if (piece.type === PIECES.OU || piece.type === PIECES.KIN) {
        return false; // 王将と金将は成れない
    }
    
    const player = piece.player; // 駒の持ち主を取得
    
    // 敵陣に入った（先手なら3段目以内、後手なら7段目以降）
    if ((player === 'black' && toRow <= 2) || (player === 'white' && toRow >= 6)) {
        return true; // 成れる
    }
    
    // 敵陣から出る（先手なら3段目以内から出る、後手なら7段目以降から出る）
    if ((player === 'black' && fromRow <= 2) || (player === 'white' && fromRow >= 6)) {
        return true; // 成れる
    }
    
    return false; // 成れない
}

// 成った時の駒の種類を返す
function getPromotedPiece(pieceType) {
    switch(pieceType) {
        case PIECES.FU: return PIECES.TO;    // 歩→と
        case PIECES.KYO: return PIECES.NKYO; // 香→成香
        case PIECES.KEI: return PIECES.NKEI; // 桂→成桂
        case PIECES.GIN: return PIECES.NGIN; // 銀→成銀
        case PIECES.KAKU: return PIECES.UMA; // 角→馬
        case PIECES.HI: return PIECES.RYU;   // 飛→龍
        default: return pieceType;           // その他（成れない）
    }
}

// 盤面を描画する関数
function renderBoard() {
    const boardElement = document.getElementById('shogi-board'); // 盤面の要素を取得
    boardElement.innerHTML = ''; // 盤面をクリア
    
    // 現在選択中のセルとハイライト位置をコンソールに出力（デバッグ用）
    if (gameState.selectedCell) {
        console.log(`選択中のセル: (${gameState.selectedCell[0]},${gameState.selectedCell[1]})`);
        console.log(`ハイライト対象: ${JSON.stringify(gameState.possibleMoves)}`);
    }
    
    for (let row = 0; row < 9; row++) { // 9行をループ
        for (let col = 0; col < 9; col++) { // 9列をループ
            const cell = document.createElement('div'); // セルを作成
            cell.className = 'cell'; // セルにクラスを追加
            cell.dataset.row = row; // 行番号をデータ属性に設定
            cell.dataset.col = col; // 列番号をデータ属性に設定
            
            const piece = gameState.board[row][col]; // 盤面から駒を取得
            if (piece) { // 駒が存在する場合
                const pieceElement = document.createElement('div'); // 駒の要素を作成
                pieceElement.className = `piece ${piece.player}`; // 駒のクラスを設定
                pieceElement.textContent = piece.type; // 駒の種類を表示
                
                cell.appendChild(pieceElement); // セルに駒を追加
            }
            
            // 選択されたセルをハイライト
            if (gameState.selectedCell && gameState.selectedCell[0] === row && gameState.selectedCell[1] === col) {
                cell.classList.add('selected'); // 選択されたセルにクラスを追加
            }
            
            // 移動可能な位置をハイライト
            const isHighlighted = gameState.possibleMoves.some(move => move[0] === row && move[1] === col);
            if (isHighlighted) {
                cell.classList.add('highlighted'); // 移動可能なセルにクラスを追加
                // デバッグ用：ハイライトしたセルにデータ属性を追加
                cell.dataset.highlighted = 'true';
            }
            
            // クリックイベントを追加（通常とタッチ対応）
            const handleClick = (e) => {
                if (e.type === 'touchstart') {
                    e.preventDefault(); // タッチイベントのデフォルト動作を防止
                }
                handleCellClick(row, col); // セルクリック時の処理を呼び出す
            };
            
            cell.addEventListener('click', handleClick); // クリックイベントを追加
            cell.addEventListener('touchstart', handleClick); // タッチイベントを追加
            
            boardElement.appendChild(cell); // 盤面にセルを追加
        }
    }
    
    // 持ち駒を表示
    renderCapturedPieces(); // 捕獲した駒を表示
}

// 持ち駒を表示する関数
function renderCapturedPieces() {
    const player1CapturedElement = document.getElementById('captured-by-player1'); // 先手の捕獲した駒の要素を取得
    const player2CapturedElement = document.getElementById('captured-by-player2'); // 後手の捕獲した駒の要素を取得
    
    player1CapturedElement.innerHTML = ''; // 先手の捕獲した駒をクリア
    player2CapturedElement.innerHTML = ''; // 後手の捕獲した駒をクリア
    
    // 先手（黒）の持ち駒
    for (const piece of gameState.capturedPieces.black) {
        const capturedPiece = document.createElement('div'); // 捕獲した駒の要素を作成
        capturedPiece.className = 'captured-piece'; // クラスを追加
        capturedPiece.textContent = piece.type; // 駒の種類を表示
        capturedPiece.dataset.pieceType = piece.type; // 駒の種類をデータ属性に設定
        
        // クリックイベントを追加
        capturedPiece.addEventListener('click', () => handleCapturedPieceClick('black', piece.type)); // クリックイベントを追加
        
        // タッチイベントを追加
        capturedPiece.addEventListener('touchstart', (e) => {
            e.preventDefault(); // デフォルトの動作を防止
            handleCapturedPieceClick('black', piece.type); // 持ち駒タッチ時の処理を呼び出す
        });
        
        player1CapturedElement.appendChild(capturedPiece); // 先手の捕獲した駒に追加
    }
    
    // 後手（白）の持ち駒
    for (const piece of gameState.capturedPieces.white) {
        const capturedPiece = document.createElement('div'); // 捕獲した駒の要素を作成
        capturedPiece.className = 'captured-piece'; // クラスを追加
        capturedPiece.textContent = piece.type; // 駒の種類を表示
        capturedPiece.dataset.pieceType = piece.type; // 駒の種類をデータ属性に設定
        
        // クリックイベントを追加
        capturedPiece.addEventListener('click', () => handleCapturedPieceClick('white', piece.type)); // クリックイベントを追加
        
        // タッチイベントを追加
        capturedPiece.addEventListener('touchstart', (e) => {
            e.preventDefault(); // デフォルトの動作を防止
            handleCapturedPieceClick('white', piece.type); // 持ち駒タッチ時の処理を呼び出す
        });
        
        player2CapturedElement.appendChild(capturedPiece); // 後手の捕獲した駒に追加
    }
}

// セルがクリックされた時の処理
function handleCellClick(row, col) {
    // ゲーム終了している場合は何もしない
    if (gameState.isGameOver) return;
    
    // 打ち駒モードの場合
    if (gameState.selectedForDrop) {
        handleDropPiece(row, col); // 駒を打つ処理を呼び出す
        return;
    }
    
    // 成り判定中の場合
    if (gameState.isPromoting) {
        return; // 成り判定中は通常の移動処理をスキップ
    }
    
    const clickedCell = gameState.board[row][col]; // クリックされたセルの駒を取得
    
    // 既に駒が選択されている場合
    if (gameState.selectedCell) {
        // 移動可能な位置がクリックされた場合
        const canMove = gameState.possibleMoves.some(move => move[0] === row && move[1] === col);
        
        if (canMove) {
            const fromRow = gameState.selectedCell[0];
            const fromCol = gameState.selectedCell[1];
            console.log(`移動: (${fromRow},${fromCol}) -> (${row},${col})`); // デバッグ用ログ
            movePiece(fromRow, fromCol, row, col); // 駒を移動する処理を呼び出す
            return;
        }
        
        // 既に選択されている駒と同じ駒をクリックした場合、選択を解除
        if (gameState.selectedCell[0] === row && gameState.selectedCell[1] === col) {
            console.log(`選択解除: (${row},${col})`); // デバッグ用ログ
            gameState.selectedCell = null; // 選択されたセルをリセット
            gameState.possibleMoves = []; // 移動可能な位置をリセット
            renderBoard(); // 盤面を再描画
            return;
        }
        
        // 自分の駒をクリックした場合、選択を切り替える
        if (clickedCell && clickedCell.player === gameState.currentPlayer) {
            console.log(`選択切替: (${row},${col})`); // デバッグ用ログ
            gameState.selectedCell = [row, col]; // 選択されたセルを保存
            gameState.possibleMoves = getPossibleMoves(row, col, clickedCell, gameState.board); // 移動可能な位置を取得
            console.log(`移動可能: ${JSON.stringify(gameState.possibleMoves)}`); // デバッグ用ログ
            renderBoard(); // 盤面を再描画
            return;
        }
        
        // 移動可能な位置でない場所がクリックされた場合、選択をリセット
        console.log(`無効な選択: (${row},${col})`); // デバッグ用ログ
        gameState.selectedCell = null; // 選択されたセルをリセット
        gameState.possibleMoves = []; // 移動可能な位置をリセット
        renderBoard(); // 盤面を再描画
    } 
    // 選択されていない状態で自分の駒をクリックした場合
    else if (clickedCell && clickedCell.player === gameState.currentPlayer) {
        // 駒を選択して移動可能な位置を計算
        console.log(`新規選択: (${row},${col}) - ${clickedCell.type}`); // デバッグ用ログ
        gameState.selectedCell = [row, col]; // 選択されたセルを保存
        gameState.possibleMoves = getPossibleMoves(row, col, clickedCell, gameState.board); // 移動可能な位置を取得
        console.log(`移動可能: ${JSON.stringify(gameState.possibleMoves)}`); // デバッグ用ログ
        
        // 移動可能な位置が1つもない場合は選択をリセット
        if (gameState.possibleMoves.length === 0) {
            console.log(`移動先なし`); // デバッグ用ログ
            gameState.selectedCell = null; // 選択されたセルをリセット
            renderBoard(); // 盤面を再描画
            return;
        }
        
        renderBoard(); // 盤面を再描画
    } else {
        // 空のマスまたは相手の駒をクリックした場合、選択をリセット
        console.log(`無効な選択: (${row},${col})`); // デバッグ用ログ
        gameState.selectedCell = null; // 選択されたセルをリセット
        gameState.possibleMoves = []; // 移動可能な位置をリセット
        renderBoard(); // 盤面を再描画
    }
}

// 駒を移動する処理
function movePiece(fromRow, fromCol, toRow, toCol) {
    console.log(`駒移動処理開始: (${fromRow},${fromCol}) -> (${toRow},${toCol})`); // デバッグ用ログ
    
    const piece = gameState.board[fromRow][fromCol]; // 移動する駒を取得
    if (!piece) {
        console.error(`エラー: 移動元のセル(${fromRow},${fromCol})に駒がありません`); // エラーログ
        return;
    }
    
    const targetCell = gameState.board[toRow][toCol]; // 移動先のセルを取得
    console.log(`移動: ${piece.player}の${piece.type} -> ${targetCell ? targetCell.player + 'の' + targetCell.type : '空きマス'}`); // デバッグ用ログ
    
    // 移動先に敵の駒がある場合は捕獲
    if (targetCell) {
        // 成っている駒は元の形に戻して持ち駒にする
        let capturedType = targetCell.type; // 捕獲した駒の種類を保存
        if (targetCell.promoted) {
            // 成り駒を元に戻す
            switch(capturedType) {
                case PIECES.TO: capturedType = PIECES.FU; break; // と金→歩
                case PIECES.NKYO: capturedType = PIECES.KYO; break; // 成香→香
                case PIECES.NKEI: capturedType = PIECES.KEI; break; // 成桂→桂
                case PIECES.NGIN: capturedType = PIECES.GIN; break; // 成銀→銀
                case PIECES.UMA: capturedType = PIECES.KAKU; break; // 龍馬→角
                case PIECES.RYU: capturedType = PIECES.HI; break; // 龍王→飛
            }
        }
        
        // 持ち駒に追加
        gameState.capturedPieces[gameState.currentPlayer].push({
            type: capturedType, // 捕獲した駒の種類
            player: gameState.currentPlayer, // 駒の持ち主
            promoted: false // 成り判定はなし
        });
        
        console.log(`駒を捕獲: ${targetCell.player}の${targetCell.type} -> ${gameState.currentPlayer}の持ち駒`); // デバッグ用ログ
    }
    
    // 駒を移動
    gameState.board[toRow][toCol] = piece; // 移動先に駒を配置
    gameState.board[fromRow][fromCol] = null; // 元の位置を空にする
    console.log(`駒移動完了: 盤面更新`); // デバッグ用ログ
    
    // 成れるかチェック
    if (canPromote(piece, fromRow, toRow)) {
        gameState.isPromoting = true; // 成り判定を有効にする
        console.log(`成り判定開始`); // デバッグ用ログ
        showPromotionDialog(toRow, toCol); // 成り判定ダイアログを表示
    } else {
        console.log(`通常移動完了 - 手番終了処理へ`); // デバッグ用ログ
        finishMove(); // 手番を終了する処理を呼び出す
    }
}

// 持ち駒クリック時の処理
function handleCapturedPieceClick(player, pieceType) {
    // 自分の手番の持ち駒だけ使える
    if (player !== gameState.currentPlayer || gameState.isGameOver || gameState.isPromoting) {
        return; // 条件を満たさない場合は何もしない
    }
    
    // 選択されたセルをリセット（持ち駒モードに切り替えるため）
    gameState.selectedCell = null; // 選択されたセルをリセット
    
    // 既に同じ種類の持ち駒が選択されている場合は選択を解除
    if (gameState.selectedForDrop && gameState.selectedForDrop.type === pieceType) {
        gameState.selectedForDrop = null; // 選択を解除
        gameState.possibleMoves = []; // 移動可能な位置をリセット
        renderBoard(); // 盤面を再描画
        return;
    }
    
    // 持ち駒を選択
    gameState.selectedForDrop = { type: pieceType, player }; // 選択された持ち駒を保存
    
    // 打てる場所を計算
    const dropPositions = getValidDropPositions(pieceType, player); // 打てる位置を取得
    
    // 打てる場所がない場合
    if (dropPositions.length === 0) {
        gameState.selectedForDrop = null; // 選択を解除
        // 打てる場所がないことを通知
        document.getElementById('status').textContent = 'この駒は現在打てる場所がありません'; // メッセージを表示
        setTimeout(() => {
            document.getElementById('status').textContent = `${gameState.currentPlayer === 'black' ? '先手' : '後手'}の手番です`; // 3秒後に元のメッセージに戻す
        }, 3000);
        return;
    }
    
    gameState.possibleMoves = dropPositions; // 移動可能な位置を保存
    renderBoard(); // 盤面を再描画
}

// 持ち駒を盤面に打つ処理
function handleDropPiece(row, col) {
    // 打てる場所かチェック
    if (!gameState.possibleMoves.some(pos => pos[0] === row && pos[1] === col)) {
        gameState.selectedForDrop = null; // 選択を解除
        gameState.possibleMoves = []; // 移動可能な位置をリセット
        renderBoard(); // 盤面を再描画
        return; // 処理を終了
    }
    
    // 持ち駒を盤面に配置
    const { type, player } = gameState.selectedForDrop; // 選択された持ち駒の情報を取得
    gameState.board[row][col] = { type, player, promoted: false }; // 盤面に駒を配置
    
    // 持ち駒リストから削除
    const index = gameState.capturedPieces[player].findIndex(p => p.type === type); // 駒のインデックスを取得
    if (index !== -1) {
        gameState.capturedPieces[player].splice(index, 1); // 持ち駒リストから削除
    }
    
    gameState.selectedForDrop = null; // 選択を解除
    gameState.possibleMoves = []; // 移動可能な位置をリセット
    
    finishMove(); // 手番を終了する処理を呼び出す
}

// 持ち駒を打てる位置を取得
function getValidDropPositions(pieceType, player) {
    const positions = []; // 打てる位置を格納する配列
    
    for (let row = 0; row < 9; row++) { // 9行をループ
        for (let col = 0; col < 9; col++) { // 9列をループ
            if (gameState.board[row][col] === null && isValidDrop(pieceType, row, col, player)) {
                positions.push([row, col]); // 打てる位置を追加
            }
        }
    }
    
    return positions; // 打てる位置を返す
}

// 指定位置に持ち駒を打てるかチェック
function isValidDrop(pieceType, row, col, player) {
    // 基本条件：空いているマス
    if (gameState.board[row][col] !== null) {
        return false; // すでに駒がある場合は打てない
    }
    
    // 歩兵の二歩チェック
    if (pieceType === PIECES.FU) {
        // 同じ段に自分の歩があるかチェック
        for (let r = 0; r < 9; r++) {
            if (gameState.board[r][col] && 
                gameState.board[r][col].player === player && 
                gameState.board[r][col].type === PIECES.FU) {
                return false; // 二歩になるので打てない
            }
        }
    }
    
    // 歩兵、香車、桂馬は前に進めない位置には打てない
    if (player === 'black') {
        // 先手（黒）の場合
        if (pieceType === PIECES.FU || pieceType === PIECES.KYO) {
            if (row === 0) return false; // 一段目には打てない
        }
        if (pieceType === PIECES.KEI) {
            if (row <= 1) return false; // 一、二段目には打てない
        }
    } else {
        // 後手（白）の場合
        if (pieceType === PIECES.FU || pieceType === PIECES.KYO) {
            if (row === 8) return false; // 九段目には打てない
        }
        if (pieceType === PIECES.KEI) {
            if (row >= 7) return false; // 八、九段目には打てない
        }
    }
    
    // 打ち歩詰めのチェック（実装略、複雑なため）
    
    return true; // 打てる位置であればtrueを返す
}

// 成り判定ダイアログを表示
function showPromotionDialog(row, col) {
    const status = document.getElementById('status'); // ステータス表示要素を取得
    status.textContent = '駒を成りますか？（はい: Y / いいえ: N）'; // メッセージを表示
    
    // 成り判定用のボタンを作成
    const promotionButtons = document.createElement('div'); // ボタンを囲むdiv要素を作成
    promotionButtons.className = 'promotion-buttons'; // クラスを追加
    
    const yesButton = document.createElement('button'); // はいボタンを作成
    yesButton.textContent = 'はい'; // ボタンのテキストを設定
    yesButton.className = 'promotion-button'; // クラスを追加
    
    const noButton = document.createElement('button'); // いいえボタンを作成
    noButton.textContent = 'いいえ'; // ボタンのテキストを設定
    noButton.className = 'promotion-button'; // クラスを追加
    
    // ボタンのクリックとタッチイベントを追加
    yesButton.addEventListener('click', () => handlePromotion(true, row, col)); // クリックイベントを追加
    noButton.addEventListener('click', () => handlePromotion(false, row, col)); // クリックイベントを追加
    
    yesButton.addEventListener('touchstart', (e) => { // タッチイベントを追加
        e.preventDefault(); // デフォルトの動作を防止
        handlePromotion(true, row, col); // 成るを選択
    });
    
    noButton.addEventListener('touchstart', (e) => { // タッチイベントを追加
        e.preventDefault(); // デフォルトの動作を防止
        handlePromotion(false, row, col); // 成らないを選択
    });
    
    // ボタンをdivに追加
    promotionButtons.appendChild(yesButton); // はいボタンを追加
    promotionButtons.appendChild(noButton); // いいえボタンを追加
    
    // ステータス要素の後にボタンを追加
    status.parentNode.insertBefore(promotionButtons, status.nextSibling); // ステータスの次の要素としてボタンを挿入
    
    // キー操作のイベントリスナーも残しておく
    const handleKeyPress = (event) => { // キー押下イベントを処理
        if (event.key.toLowerCase() === 'y') {
            handlePromotion(true, row, col); // 成るを選択
            document.removeEventListener('keydown', handleKeyPress); // イベントリスナーを解除
        } else if (event.key.toLowerCase() === 'n') {
            handlePromotion(false, row, col); // 成らないを選択
            document.removeEventListener('keydown', handleKeyPress); // イベントリスナーを解除
        }
    };
    
    document.addEventListener('keydown', handleKeyPress); // キー押下イベントを追加
}

// 成り判定の処理を行う関数
function handlePromotion(shouldPromote, row, col) {
    // 成り判定用のボタンを削除
    const promotionButtons = document.querySelector('.promotion-buttons'); // ボタン要素を取得
    if (promotionButtons) {
        promotionButtons.remove(); // ボタン要素を削除
    }
    
    if (shouldPromote) {
        // 成る
        const piece = gameState.board[row][col]; // 成る駒を取得
        piece.type = getPromotedPiece(piece.type); // 成った駒の種類を取得
        piece.promoted = true; // 成りフラグを設定
    }
    
    finishMove(); // 手番を終了する処理を呼び出す
}

// 手番を終了する処理
function finishMove() {
    // 王を取られたらゲーム終了
    if (checkGameOver()) {
        gameState.isGameOver = true; // ゲーム終了フラグを設定
        gameState.winner = gameState.currentPlayer; // 勝者を設定
        document.getElementById('status').textContent = `${gameState.currentPlayer === 'black' ? '先手' : '後手'}の勝利！`; // 勝者を表示
        updatePlayerIndicator(); // プレイヤーインジケーターを更新
    } else {
        // 手番交代
        gameState.currentPlayer = gameState.currentPlayer === 'black' ? 'white' : 'black'; // 手番を交代
        document.getElementById('status').textContent = `${gameState.currentPlayer === 'black' ? '先手' : '後手'}の手番です`; // 現在の手番を表示
        updatePlayerIndicator(); // プレイヤーインジケーターを更新
    }
    
    // 状態をリセット
    gameState.selectedCell = null; // 選択されたセルをリセット
    gameState.possibleMoves = []; // 移動可能な位置をリセット
    gameState.isPromoting = false; // 成り判定をリセット
    
    renderBoard(); // 盤面を再描画
}

// ゲーム終了チェック（王が盤上にあるか）
function checkGameOver() {
    let blackKingExists = false; // 先手の王が存在するか
    let whiteKingExists = false; // 後手の王が存在するか
    
    for (let row = 0; row < 9; row++) { // 9行をループ
        for (let col = 0; col < 9; col++) { // 9列をループ
            const piece = gameState.board[row][col]; // 盤面から駒を取得
            if (piece && piece.type === PIECES.OU) { // 王将が存在するかチェック
                if (piece.player === 'black') {
                    blackKingExists = true; // 先手の王が存在
                } else {
                    whiteKingExists = true; // 後手の王が存在
                }
            }
        }
    }
    
    return !blackKingExists || !whiteKingExists; // どちらかの王が存在しない場合はゲーム終了
}

// プレイヤーの手番表示を更新する関数
function updatePlayerIndicator() {
    const player1Element = document.getElementById('player1'); // 先手の要素を取得
    const player2Element = document.getElementById('player2'); // 後手の要素を取得
    
    if (player1Element && player2Element) {
        // アクティブクラスをリセット
        player1Element.classList.remove('active');
        player2Element.classList.remove('active');
        
        // 現在の手番に応じてアクティブクラスを追加
        if (gameState.currentPlayer === 'black') {
            player1Element.classList.add('active');
        } else {
            player2Element.classList.add('active');
        }
        
        console.log(`プレイヤー表示更新: ${gameState.currentPlayer === 'black' ? '先手' : '後手'}の番`); // デバッグ用ログ
    } else {
        console.error('プレイヤー表示要素が見つかりません'); // エラーログ
    }
}

// ゲームリセット
function resetGame() {
    gameState.board = initializeBoard(); // 盤面を初期化
    gameState.selectedCell = null; // 選択されたセルをリセット
    gameState.currentPlayer = 'black'; // 先手から開始
    gameState.possibleMoves = []; // 移動可能な位置をリセット
    gameState.capturedPieces = { black: [], white: [] }; // 捕獲した駒をリセット
    gameState.isGameOver = false; // ゲーム終了フラグをリセット
    gameState.winner = null; // 勝者をリセット
    gameState.isPromoting = false; // 成り判定をリセット
    gameState.selectedForDrop = null; // 打ち駒選択状態をリセット
    
    document.getElementById('status').textContent = '先手の手番です'; // ステータスを表示
    updatePlayerIndicator(); // プレイヤーインジケーターを更新
    renderBoard(); // 盤面を再描画
}

// イベントリスナーの設定
document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('reset-game').addEventListener('click', resetGame); // リセットボタンにイベントを追加
    gameState.board = initializeBoard(); // 盤面を初期化
    renderBoard(); // 盤面を描画
    document.getElementById('status').textContent = '先手の手番です'; // ステータスを表示
    updatePlayerIndicator(); // プレイヤーインジケーターを更新
});