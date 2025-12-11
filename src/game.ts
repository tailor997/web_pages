// 定义游戏方向类型
export type Direction = 'up' | 'down' | 'left' | 'right' | 'none';

// 定义游戏状态类型
export type GameState = 'playing' | 'paused' | 'gameOver' | 'won';

// 定义游戏格子类型
type Cell = number | null;

// 定义游戏板类型
type Board = Cell[][];

// 定义游戏状态快照类型
type GameSnapshot = {
    board: Board;
    score: number;
    state: GameState;
};

// 游戏类
export class Game2048 {
    private board: Board;
    private score: number;
    private state: GameState;
    private size: number;
    private onScoreChange: (score: number) => void;
    private onStateChange: (state: GameState) => void;
    private onBoardChange: (board: Board) => void;
    private history: GameSnapshot[];
    private maxHistorySize: number;

    constructor(
        size: number = 4,
        onScoreChange: (score: number) => void,
        onStateChange: (state: GameState) => void,
        onBoardChange: (board: Board) => void
    ) {
        this.size = size;
        this.onScoreChange = onScoreChange;
        this.onStateChange = onStateChange;
        this.onBoardChange = onBoardChange;
        // 初始化空白游戏板
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.score = 0;
        this.state = 'paused';
        this.history = [];
        this.maxHistorySize = 7;
    }

    // 初始化游戏
    public init(): void {
        this.board = Array(this.size).fill(null).map(() => Array(this.size).fill(null));
        this.score = 0;
        this.state = 'playing';
        this.history = [];
        this.generateNewTile();
        this.generateNewTile();
        this.updateUI();
    }

    // 生成新的数字块
    private generateNewTile(): void {
        const emptyCells: { x: number; y: number }[] = [];
        
        // 找到所有空单元格
        for (let i = 0; i < this.size; i++) {
            for (let j = 0; j < this.size; j++) {
                if (this.board[i][j] === null) {
                    emptyCells.push({ x: j, y: i });
                }
            }
        }
        
        if (emptyCells.length > 0) {
            // 随机选择一个空单元格
            const randomCell = emptyCells[Math.floor(Math.random() * emptyCells.length)];
            // 90% 概率生成 2，10% 概率生成 4
            this.board[randomCell.y][randomCell.x] = Math.random() < 0.9 ? 2 : 4;
        }
    }

    // 保存游戏快照到历史记录
    private saveSnapshot(): void {
        // 创建当前状态的深拷贝
        const snapshot: GameSnapshot = {
            board: this.copyBoard(),
            score: this.score,
            state: this.state
        };
        
        // 添加到历史记录
        this.history.push(snapshot);
        
        // 限制历史记录大小
        if (this.history.length > this.maxHistorySize) {
            this.history.shift();
        }
    }

    // 移动方块
    public move(direction: Direction): void {
        if (this.state !== 'playing' || direction === 'none') return;
        
        // 保存当前状态到历史记录
        this.saveSnapshot();
        
        let moved = false;
        
        switch (direction) {
            case 'up':
                moved = this.moveUp();
                break;
            case 'down':
                moved = this.moveDown();
                break;
            case 'left':
                moved = this.moveLeft();
                break;
            case 'right':
                moved = this.moveRight();
                break;
        }
        
        // 如果有移动，生成新方块并检查游戏状态
        if (moved) {
            this.generateNewTile();
            this.checkGameState();
            this.updateUI();
        }
    }

    // 向上移动
    private moveUp(): boolean {
        let moved = false;
        
        for (let col = 0; col < this.size; col++) {
            const column = this.getColumn(col);
            const newColumn = this.merge(column);
            if (!this.arraysEqual(column, newColumn)) {
                moved = true;
                this.setColumn(col, newColumn);
            }
        }
        
        return moved;
    }

    // 向下移动
    private moveDown(): boolean {
        let moved = false;
        
        for (let col = 0; col < this.size; col++) {
            const column = this.getColumn(col).reverse();
            const newColumn = this.merge(column).reverse();
            if (!this.arraysEqual(this.getColumn(col), newColumn)) {
                moved = true;
                this.setColumn(col, newColumn);
            }
        }
        
        return moved;
    }

    // 向左移动
    private moveLeft(): boolean {
        let moved = false;
        
        for (let row = 0; row < this.size; row++) {
            const newRow = this.merge(this.board[row]);
            if (!this.arraysEqual(this.board[row], newRow)) {
                moved = true;
                this.board[row] = newRow;
            }
        }
        
        return moved;
    }

    // 向右移动
    private moveRight(): boolean {
        let moved = false;
        
        for (let row = 0; row < this.size; row++) {
            const reversedRow = this.board[row].reverse();
            const newRow = this.merge(reversedRow).reverse();
            if (!this.arraysEqual(this.board[row], newRow)) {
                moved = true;
                this.board[row] = newRow;
            }
        }
        
        return moved;
    }

    // 合并一行或一列
    private merge(line: Cell[]): Cell[] {
        // 移除空格
        const filtered = line.filter(cell => cell !== null) as number[];
        const merged: Cell[] = [];
        let i = 0;
        
        // 合并相同数字
        while (i < filtered.length) {
            if (i < filtered.length - 1 && filtered[i] === filtered[i + 1]) {
                const mergedValue = filtered[i] * 2;
                merged.push(mergedValue);
                this.score += mergedValue;
                i += 2;
            } else {
                merged.push(filtered[i]);
                i++;
            }
        }
        
        // 填充空格
        while (merged.length < this.size) {
            merged.push(null);
        }
        
        return merged;
    }

    // 获取列
    private getColumn(col: number): Cell[] {
        return this.board.map(row => row[col]);
    }

    // 设置列
    private setColumn(col: number, column: Cell[]): void {
        for (let row = 0; row < this.size; row++) {
            this.board[row][col] = column[row];
        }
    }

    // 复制游戏板
    private copyBoard(): Board {
        return this.board.map(row => [...row]);
    }

    // 比较两个数组是否相等
    private arraysEqual(a: Cell[], b: Cell[]): boolean {
        return a.length === b.length && a.every((val, index) => val === b[index]);
    }

    // 检查游戏状态
    private checkGameState(): void {
        // 检查是否胜利（达到2048）
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                if (this.board[row][col] === 2048) {
                    this.state = 'won';
                    this.onStateChange(this.state);
                    return;
                }
            }
        }
        
        // 检查是否还有空单元格
        for (let row = 0; row < this.size; row++) {
            if (this.board[row].includes(null)) {
                return; // 还有空单元格，游戏继续
            }
        }
        
        // 检查是否还有可能合并的单元格
        for (let row = 0; row < this.size; row++) {
            for (let col = 0; col < this.size; col++) {
                const current = this.board[row][col];
                
                // 检查右侧单元格
                if (col < this.size - 1 && current === this.board[row][col + 1]) {
                    return; // 可以合并，游戏继续
                }
                
                // 检查下方单元格
                if (row < this.size - 1 && current === this.board[row + 1][col]) {
                    return; // 可以合并，游戏继续
                }
            }
        }
        
        // 游戏结束
        this.state = 'gameOver';
        this.onStateChange(this.state);
    }

    // 更新 UI
    private updateUI(): void {
        this.onScoreChange(this.score);
        this.onBoardChange(this.board);
    }

    // 暂停游戏
    public pause(): void {
        if (this.state === 'playing') {
            this.state = 'paused';
            this.onStateChange(this.state);
        }
    }

    // 继续游戏
    public resume(): void {
        if (this.state === 'paused') {
            this.state = 'playing';
            this.onStateChange(this.state);
        }
    }

    // 重新开始游戏
    public restart(): void {
        this.init();
    }

    // 获取当前游戏状态
    public getState(): GameState {
        return this.state;
    }

    // 获取当前分数
    public getScore(): number {
        return this.score;
    }

    // 获取当前游戏板
    public getBoard(): Board {
        return this.copyBoard();
    }
    
    // 悔棋
    public undo(): boolean {
        if (this.history.length === 0) {
            return false; // 没有历史记录可悔棋
        }
        
        // 从历史记录中取出最后一个快照
        const snapshot = this.history.pop()!;
        
        // 恢复状态
        this.board = snapshot.board;
        this.score = snapshot.score;
        this.state = snapshot.state;
        
        // 更新UI
        this.updateUI();
        
        return true;
    }
    
    // 获取历史记录大小
    public getHistorySize(): number {
        return this.history.length;
    }
    
    // 获取最大历史记录大小
    public getMaxHistorySize(): number {
        return this.maxHistorySize;
    }
    
    // 检查是否可以悔棋
    public canUndo(): boolean {
        return this.history.length > 0;
    }
}
