interface Todo {
    id: number;
    text: string;
    completed: boolean;
    createdAt: Date;
    type: PokemonType;
}

type PokemonType = 'fire' | 'water' | 'grass' | 'electric' | 'psychic' | 'normal';

class PokemonTodoApp {
    private todos: Todo[] = [];
    private filteredTodos: Todo[] = [];
    private currentFilter: string = 'all';
    
    private todoInput!: HTMLInputElement;
    private addTodoBtn!: HTMLButtonElement;
    private todoList!: HTMLUListElement;
    private errorMessage!: HTMLDivElement;
    private totalTasksEl!: HTMLDivElement;
    private completedTasksEl!: HTMLDivElement;
    private pendingTasksEl!: HTMLDivElement;
    private filterButtons!: NodeListOf<HTMLButtonElement>;
    private completeAllBtn!: HTMLButtonElement;
    private resetAllBtn!: HTMLButtonElement;
    private clearAllBtn!: HTMLButtonElement;

    constructor() {
        this.initializeElements();
        this.loadTodos();
        this.setupEventListeners();
        this.filterTodos();
        this.renderTodos();
        this.updateStats();
    }

    private initializeElements(): void {
        this.todoInput = document.getElementById('todoInput') as HTMLInputElement;
        this.addTodoBtn = document.getElementById('addTodoBtn') as HTMLButtonElement;
        this.todoList = document.getElementById('todoList') as HTMLUListElement;
        this.errorMessage = document.getElementById('errorMessage') as HTMLDivElement;
        this.totalTasksEl = document.getElementById('totalTasks') as HTMLDivElement;
        this.completedTasksEl = document.getElementById('completedTasks') as HTMLDivElement;
        this.pendingTasksEl = document.getElementById('pendingTasks') as HTMLDivElement;
        this.filterButtons = document.querySelectorAll('.filter-btn') as NodeListOf<HTMLButtonElement>;
        this.completeAllBtn = document.getElementById('completeAllBtn') as HTMLButtonElement;
        this.resetAllBtn = document.getElementById('resetAllBtn') as HTMLButtonElement;
        this.clearAllBtn = document.getElementById('clearAllBtn') as HTMLButtonElement;
    }

    private setupEventListeners(): void {
        this.addTodoBtn.addEventListener('click', () => this.addTodo());
        
        this.todoInput.addEventListener('keypress', (e: KeyboardEvent) => {
            if (e.key === 'Enter') this.addTodo();
        });
        
        this.filterButtons.forEach(button => {
            button.addEventListener('click', (e: Event) => {
                const target = e.currentTarget as HTMLButtonElement;
                const filter = target.getAttribute('data-filter') || 'all';
                this.setFilter(filter);
            });
        });
        
        this.completeAllBtn.addEventListener('click', () => this.completeAllTodos());
        this.resetAllBtn.addEventListener('click', () => this.resetAllTodos());
        this.clearAllBtn.addEventListener('click', () => this.clearAllTodos());
    }

    private setFilter(filter: string): void {
        this.currentFilter = filter;
        
        this.filterButtons.forEach(button => {
            const buttonFilter = button.getAttribute('data-filter');
            if (buttonFilter === filter) {
                button.classList.add('active');
            } else {
                button.classList.remove('active');
            }
        });
        
        this.filterTodos();
        this.renderTodos();
    }

    private filterTodos(): void {
        switch (this.currentFilter) {
            case 'completed':
                this.filteredTodos = this.todos.filter(todo => todo.completed);
                break;
            case 'pending':
                this.filteredTodos = this.todos.filter(todo => !todo.completed);
                break;
            default:
                this.filteredTodos = [...this.todos];
        }
    }

    private addTodo(): void {
        const todoText = this.todoInput.value.trim();
        
        if (!todoText) {
            this.showError("Oops! Jangan biarkan input kosong seperti Poké Ball tanpa Pokemon!");
            return;
        }
        
        const types: PokemonType[] = ['fire', 'water', 'grass', 'electric', 'psychic', 'normal'];
        const randomType = types[Math.floor(Math.random() * types.length)];
        
        const newTodo: Todo = {
            id: Date.now(),
            text: todoText,
            completed: false,
            createdAt: new Date(),
            type: randomType
        };
        
        this.todos.unshift(newTodo);
        this.saveTodos();
        this.filterTodos();
        this.renderTodos();
        this.updateStats();
        this.clearInput();
        this.hideError();
        
        this.showToast("Poké-Task berhasil ditambahkan!", "success");
    }

    private deleteTodo(id: number): void {
        const todoToDelete = this.todos.find(todo => todo.id === id);
        if (!todoToDelete) return;
        
        if (confirm(`Yakin ingin menghapus task: "${todoToDelete.text}"?`)) {
            this.todos = this.todos.filter(todo => todo.id !== id);
            this.saveTodos();
            this.filterTodos();
            this.renderTodos();
            this.updateStats();
            
            this.showToast("Poké-Task berhasil dihapus!", "success");
        }
    }

    private clearAllTodos(): void {
        if (this.todos.length === 0) {
            this.showToast("Tidak ada tugas untuk dihapus!", "warning");
            return;
        }
        
        if (confirm(`Apakah Anda yakin ingin menghapus semua ${this.todos.length} Poké-Tasks?`)) {
            this.todos = [];
            this.saveTodos();
            this.filterTodos();
            this.renderTodos();
            this.updateStats();
            
            this.showToast("Semua Poké-Tasks berhasil dihapus!", "success");
        }
    }

    private completeAllTodos(): void {
        if (this.todos.length === 0) {
            this.showToast("Tidak ada tugas untuk diselesaikan!", "warning");
            return;
        }
        
        const pendingTodos = this.todos.filter(todo => !todo.completed).length;
        
        if (pendingTodos === 0) {
            this.showToast("Semua tugas sudah selesai!", "info");
            return;
        }
        
        if (confirm(`Selesaikan semua ${pendingTodos} tugas yang belum selesai?`)) {
            this.todos = this.todos.map(todo => ({
                ...todo,
                completed: true
            }));
            
            this.saveTodos();
            this.filterTodos();
            this.renderTodos();
            this.updateStats();
            
            this.showCompletionAnimation();
            this.showToast(`Semua ${pendingTodos} tugas berhasil diselesaikan!`, "success");
        }
    }

    private resetAllTodos(): void {
        if (this.todos.length === 0) {
            this.showToast("Tidak ada tugas untuk direset!", "warning");
            return;
        }
        
        const completedTodos = this.todos.filter(todo => todo.completed).length;
        
        if (completedTodos === 0) {
            this.showToast("Tidak ada tugas yang sudah selesai!", "info");
            return;
        }
        
        if (confirm(`Reset status semua ${completedTodos} tugas yang sudah selesai?`)) {
            this.todos = this.todos.map(todo => ({
                ...todo,
                completed: false
            }));
            
            this.saveTodos();
            this.filterTodos();
            this.renderTodos();
            this.updateStats();
            
            this.showToast(`Status ${completedTodos} tugas berhasil direset!`, "success");
        }
    }

    private toggleTodoStatus(id: number): void {
        this.todos = this.todos.map(todo => {
            if (todo.id === id) {
                return { ...todo, completed: !todo.completed };
            }
            return todo;
        });
        
        this.saveTodos();
        this.filterTodos();
        this.renderTodos();
        this.updateStats();
        
        const updatedTodo = this.todos.find(todo => todo.id === id);
        if (updatedTodo) {
            const status = updatedTodo.completed ? "selesai" : "belum selesai";
            this.showToast(`Tugas diubah menjadi ${status}!`, "info");
        }
    }

    private saveTodos(): void {
        try {
            localStorage.setItem('pokemonTodos', JSON.stringify(this.todos));
        } catch (error) {
            console.error("Gagal menyimpan data ke localStorage:", error);
            this.showToast("Gagal menyimpan data. Storage mungkin penuh.", "error");
        }
    }

    private loadTodos(): void {
        try {
            const savedTodos = localStorage.getItem('pokemonTodos');
            if (savedTodos) {
                const parsedTodos = JSON.parse(savedTodos) as Todo[];
                this.todos = parsedTodos.map(todo => ({
                    ...todo,
                    createdAt: new Date(todo.createdAt)
                }));
            }
        } catch (error) {
            console.error("Gagal memuat data dari localStorage:", error);
            this.todos = [];
        }
    }

    private renderTodos(): void {
        if (this.filteredTodos.length === 0) {
            let message = "";
            let title = "";
            
            switch (this.currentFilter) {
                case 'completed':
                    title = "Belum ada tugas selesai";
                    message = "Belum ada tugas yang selesai. Ayo selesaikan beberapa tugas!";
                    break;
                case 'pending':
                    title = "Semua tugas sudah selesai!";
                    message = "Wah, semua tugas sudah selesai! Tambahkan tugas baru atau istirahat sejenak.";
                    break;
                default:
                    title = "Wow, begitu kosong!";
                    message = "Tambahkan tugas pertama Anda untuk memulai petualangan!";
            }
            
            this.todoList.innerHTML = `
                <li class="empty-state">
                    <div class="pokemon-ball"></div>
                    <h3>${title}</h3>
                    <p>${message}</p>
                </li>
            `;
            return;
        }
        
        this.todoList.innerHTML = '';
        
        const typeNames: Record<PokemonType, string> = {
            fire: 'Fire',
            water: 'Water',
            grass: 'Grass',
            electric: 'Electric',
            psychic: 'Psychic',
            normal: 'Normal'
        };
        
        this.filteredTodos.forEach(todo => {
            const todoItem = document.createElement('li');
            todoItem.className = `todo-item pokemon-type-${todo.type} ${todo.completed ? 'completed' : ''}`;
            
            todoItem.innerHTML = `
                <div class="todo-content">
                    <input type="checkbox" class="pokemon-checkbox" ${todo.completed ? 'checked' : ''}>
                    <span class="todo-text ${todo.completed ? 'completed' : ''}">
                        ${this.escapeHtml(todo.text)}
                        <span class="type-badge type-${todo.type}">${typeNames[todo.type]}</span>
                    </span>
                </div>
                <div class="todo-actions">
                    <button class="action-btn delete-btn" data-id="${todo.id}">
                        <i class="fas fa-trash"></i> Hapus
                    </button>
                </div>
            `;
            
            const checkbox = todoItem.querySelector('.pokemon-checkbox') as HTMLInputElement;
            checkbox.addEventListener('change', () => this.toggleTodoStatus(todo.id));
            
            const deleteBtn = todoItem.querySelector('.delete-btn') as HTMLButtonElement;
            deleteBtn.addEventListener('click', () => this.deleteTodo(todo.id));
            
            this.todoList.appendChild(todoItem);
        });
    }

    private escapeHtml(text: string): string {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    private updateStats(): void {
        const total = this.todos.length;
        const completed = this.todos.filter(todo => todo.completed).length;
        const pending = total - completed;
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
        
        this.totalTasksEl.textContent = total.toString();
        this.completedTasksEl.textContent = completed.toString();
        this.pendingTasksEl.textContent = pending.toString();
        
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        
        if (progressBar && progressPercentage) {
            progressBar.style.width = `${completionRate}%`;
            progressPercentage.textContent = `${completionRate}%`;
        }
    }

    private showCompletionAnimation(): void {
        const animation = document.createElement('div');
        animation.className = 'completion-animation';
        animation.innerHTML = `
            <div class="celebration">
                <i class="fas fa-trophy"></i>
                <h3>Selamat!</h3>
                <p>Semua tugas telah diselesaikan!</p>
            </div>
        `;
        
        animation.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.7);
            display: flex;
            justify-content: center;
            align-items: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        `;
        
        const celebration = animation.querySelector('.celebration') as HTMLDivElement;
        celebration.style.cssText = `
            background: linear-gradient(135deg, var(--pokemon-red), var(--pokemon-blue));
            color: white;
            padding: 30px;
            border-radius: 15px;
            text-align: center;
            animation: bounceIn 0.5s ease;
        `;
        
        document.body.appendChild(animation);
        
        setTimeout(() => {
            animation.style.animation = 'fadeOut 0.3s ease';
            setTimeout(() => {
                if (animation.parentNode) {
                    document.body.removeChild(animation);
                }
            }, 300);
        }, 2000);
    }

    private showToast(message: string, type: 'success' | 'warning' | 'error' | 'info' = 'info'): void {
        const existingToast = document.querySelector('.toast-notification');
        if (existingToast && existingToast.parentNode) {
            document.body.removeChild(existingToast);
        }
        
        const toast = document.createElement('div');
        toast.className = `toast-notification ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => {
                if (toast.parentNode) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }

    private getToastIcon(type: string): string {
        switch (type) {
            case 'success': return 'check-circle';
            case 'warning': return 'exclamation-triangle';
            case 'error': return 'times-circle';
            case 'info': return 'info-circle';
            default: return 'info-circle';
        }
    }

    private showError(message: string): void {
        this.errorMessage.textContent = message;
        this.errorMessage.style.display = 'block';
        this.todoInput.style.borderColor = 'var(--pokemon-red)';
        
        setTimeout(() => this.hideError(), 3000);
    }

    private hideError(): void {
        this.errorMessage.style.display = 'none';
        this.todoInput.style.borderColor = 'var(--pokemon-blue)';
    }

    private clearInput(): void {
        this.todoInput.value = '';
        this.todoInput.focus();
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
    }
    
    @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
    }
    
    @keyframes bounceIn {
        0% { transform: scale(0.3); }
        50% { transform: scale(1.05); }
        100% { transform: scale(1); }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new PokemonTodoApp();
});