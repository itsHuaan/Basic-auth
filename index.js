const getEl = (id) => document.getElementById(id);
const getVal = (id) => document.getElementById(id).value;

document.addEventListener('DOMContentLoaded', () => {
    if (localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        updateIcon(true);
    } else {
        document.documentElement.classList.remove('dark');
        updateIcon(false);
    }
});

function toggleDarkMode() {
    const html = document.documentElement;
    if (html.classList.contains('dark')) {
        html.classList.remove('dark');
        localStorage.setItem('theme', 'light');
        updateIcon(false);
    } else {
        html.classList.add('dark');
        localStorage.setItem('theme', 'dark');
        updateIcon(true);
    }
}

function updateIcon(isDark) {
    const icon = getEl('darkModeIcon');
    if (icon) {
        icon.className = isDark ? 'fa-solid fa-sun text-lg' : 'fa-solid fa-moon text-lg';
    }
}

function switchTab(tabName) {
    document.querySelectorAll('[id^="view-"]').forEach(el => el.classList.add('hidden'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active', 'border-blue-600', 'text-blue-600'));

    getEl(`view-${tabName}`).classList.remove('hidden');
    getEl(`tab-${tabName}`).classList.add('active');
}

function showToast(title, message, type = 'success') {
    const container = getEl('toast-container');
    const toast = document.createElement('div');
    toast.className = `toast ${type} mb-2`;

    toast.innerHTML = `
        <div>
            <div class="toast-title ${type === 'success' ? 'text-green-700' : 'text-red-700'}">${title}</div>
            <div class="toast-msg">${message}</div>
        </div>
        <button class="close-btn text-slate-400 hover:text-slate-600 ml-4 outline-none">
            <i class="fa-solid fa-times"></i>
        </button>
    `;

    const closeToast = () => {
        if (toast.classList.contains('fade-out')) return;
        toast.classList.add('fade-out');
        setTimeout(() => {
            if (toast.parentElement) toast.remove();
        }, 300);
    };
    toast.querySelector('.close-btn').onclick = closeToast;
    container.appendChild(toast);
    setTimeout(closeToast, 4000);
}

function renderBadges(list, colorClass) {
    if (!list || list.length === 0) return '<span class="text-slate-400 text-xs">None</span>';
    return list.map(item => `<span class="inline-block px-2 py-0.5 rounded text-xs font-medium bg-${colorClass}-100 text-${colorClass}-700 mr-1 mb-1">${item}</span>`).join('');
}

function renderData(data) {
    const display = getEl('dataDisplay');
    const footer = getEl('actionFooter');
    display.innerHTML = '';

    const users = data.basicAuthUser || [];
    const rules = data.basicAuthRules || [];

    const userSection = document.createElement('div');
    userSection.innerHTML = `
        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center"><i class="fa-solid fa-users text-blue-500 mr-2"></i> Users (${users.length})</h3>
        <div class="dark:bg-slate-800 bg-white rounded-lg border border-slate-200 overflow-hidden mb-8">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="w-12 text-center">#</th>
                        <th class="w-1/4">Username</th>
                        <th class="w-1/4">Password</th>
                        <th>Roles</th>
                    </tr>
                </thead>
                <tbody>
                    ${users.length ? users.map((u, index) => `
                        <tr>
                            <td class="text-center text-slate-400 font-mono text-xs">${index + 1}</td>
                            <td class="font-medium text-slate-700">${u.username}</td>
                            <td class="font-mono text-xs text-slate-500">●●●●●●●●</td>
                            <td>${renderBadges(u.roles, 'blue')}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="3" class="text-center italic text-slate-400 py-4">No users found</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    display.appendChild(userSection);

    const ruleSection = document.createElement('div');
    ruleSection.innerHTML = `
        <h3 class="text-lg font-bold text-slate-800 mb-3 flex items-center"><i class="fa-solid fa-shield text-purple-500 mr-2"></i> Rules (${rules.length})</h3>
        <div class="dark:bg-slate-800 bg-white rounded-lg border border-slate-200 overflow-hidden">
            <table class="data-table">
                <thead>
                    <tr>
                        <th class="w-12 text-center">#</th>
                        <th class="w-1/3">Path Pattern</th>
                        <th class="w-1/3">Methods</th>
                        <th>Required Roles</th>
                    </tr>
                </thead>
                <tbody>
                    ${rules.length ? rules.map((r, index) => `
                        <tr>
                            <td class="text-center text-slate-400 font-mono text-xs">${index + 1}</td>
                            <td class="font-mono text-xs text-blue-600 font-bold">${r.path}</td>
                            <td>${renderBadges(r.methods, 'green')}</td>
                            <td>${renderBadges(r.roles, 'purple')}</td>
                        </tr>
                    `).join('') : '<tr><td colspan="3" class="text-center italic text-slate-400 py-4">No rules found</td></tr>'}
                </tbody>
            </table>
        </div>
    `;
    display.appendChild(ruleSection);

    footer.classList.remove('hidden');
    footer.innerHTML = `
        <button onclick="handleReload()" class="text-xs text-slate-400 hover:text-purple-600 underline px-3">
            Force Server Cache Sync
        </button>
        <button onclick="handleGetConfig()" class="bg-slate-800 hover:bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center shadow-lg">
            <i class="fa-solid fa-rotate mr-2"></i> Reload Data
        </button>
    `;

    getEl('lastUpdated').innerText = `Updated: ${new Date().toLocaleTimeString()}`;
}

function clearActionForms() {
    document.querySelectorAll('[id^="view-"] input').forEach(el => el.value = '');
}

function getErrorMessage(message) {
    const rawMessage = message || "Unknown Error";
    if (rawMessage.includes("security.invalid.basic.crednetials")) {
        return "Incorrect username or password";
    } else if (rawMessage.includes("User does not have required roles for path")) {
        return "You are not allowed to use this feature"
    }
    return rawMessage;
}

async function callApi(endpoint, method, body = null) {
    const baseUrl = getVal('baseUrl').replace(/\/$/, '');
    const url = `${baseUrl}/api/basic-auth${endpoint}`;
    const username = getVal('authUsername');
    const password = getVal('authPassword');

    if (!username || !password) {
        showToast('Auth Error', 'Admin Credentials are required', 'error');
        return;
    }

    try {
        const headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Basic ' + btoa(username + ":" + password)
        };
        const options = { method, headers };
        if (body && method !== 'GET') options.body = JSON.stringify(body);

        const res = await fetch(url, options);
        let data;
        try { data = await res.json(); } catch { data = null; }

        if (!res.ok) throw new Error(data?.message || res.statusText);

        if (endpoint.includes('/get-config')) {
            if (data && data.data) {
                renderData(data.data);
                showToast('Reloaded', 'Data have been reloaded', 'success');
            }
        } else if (endpoint.includes('/reload-config')) {
            showToast('Cache Synced', 'Redis Cache has been synced', 'success');
            handleGetConfig();
        } else {
            showToast('Success', 'Action successfully!');
            clearActionForms();
            handleGetConfig();
        }

    } catch (err) {
        const errorMessage = getErrorMessage(err.message || err.toString());
        showToast('Request Failed', errorMessage, 'error');
        console.error(err);
        if (endpoint.includes('/get-config')) {
            getEl('dataDisplay').innerHTML = `
                <div class="text-center text-red-500 h-full flex flex-col items-center justify-center">
                    <i class="fa-solid fa-circle-exclamation text-5xl mb-3"></i>
                    <p>Failed to load data.</p>
                    <p class="text-xs font-mono mt-1">${errorMessage}</p>
                    <button onclick="handleGetConfig()" class="mt-4 text-blue-600 hover:underline">Try Again</button>
                </div>
            `;
        }
    }
}

function handleUpsert() {
    const body = {
        userId: getVal('upUserId') || null,
        username: getVal('upUsername') || null,
        password: getVal('upPassword') || null,
        pathId: getVal('upPathId') || null,
        pathPattern: getVal('upPathPattern') || null,
        httpMethods: getVal('upHttpMethods') ? getVal('upHttpMethods').split(',').map(s => s.trim()) : null,
        roleNames: getVal('upRoleNames') ? getVal('upRoleNames').split(',').map(s => s.trim()) : null,
        status: 1
    };
    callApi('/upsert-basic-auth-rule', 'POST', body);
}

function handleDelete() {
    const body = {
        userId: getVal('delUserId') || null,
        username: getVal('delUsername') || null,
        pathId: getVal('delPathId') || null,
        pathPattern: getVal('delPathPattern') || null
    };
    callApi('/delete-basic-auth-rule', 'POST', body);
}

function handleRevoke() {
    const body = {
        userId: getVal('rvUserId') || null,
        username: getVal('rvUsername') || null,
        pathId: getVal('rvPathId') || null,
        pathPattern: getVal('rvPathPattern') || null,
        roleNames: getVal('rvRoleNames') ? getVal('rvRoleNames').split(',').map(s => s.trim()) : null
    };
    callApi('/revoke-role', 'POST', body);
}

function handleGetConfig() {
    callApi(`/get-config`, 'GET');
}

function handleReload() {
    callApi('/reload-config', 'GET');
}