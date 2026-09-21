package com.klu.gateway.controller;

import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;
import reactor.core.publisher.Mono;

@RestController
public class GatewayHomeController {

    @GetMapping(value = "/", produces = MediaType.TEXT_HTML_VALUE)
    public Mono<String> home() {
        String html = """
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Bibliotech Circulation Platform | API Gateway</title>
                <link rel="preconnect" href="https://fonts.googleapis.com">
                <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
                <style>
                    :root {
                        --bg-primary: #0b0f19;
                        --bg-secondary: #111827;
                        --bg-card: rgba(31, 41, 55, 0.7);
                        --border-color: rgba(255, 255, 255, 0.08);
                        --text-primary: #f9fafb;
                        --text-secondary: #9ca3af;
                        --accent-blue: #3b82f6;
                        --accent-cyan: #06b6d4;
                        --accent-green: #10b981;
                        --accent-purple: #8b5cf6;
                    }
                    * {
                        box-sizing: border-box;
                        margin: 0;
                        padding: 0;
                    }
                    body {
                        font-family: 'Inter', sans-serif;
                        background: radial-gradient(circle at 50% 0%, #1e1b4b 0%, #0b0f19 75%);
                        color: var(--text-primary);
                        min-height: 100vh;
                        padding: 2.5rem 1.5rem;
                        line-height: 1.5;
                    }
                    .container {
                        max-width: 1040px;
                        margin: 0 auto;
                    }
                    header {
                        text-align: center;
                        margin-bottom: 2.5rem;
                    }
                    .badge {
                        display: inline-flex;
                        align-items: center;
                        gap: 0.5rem;
                        padding: 0.35rem 0.9rem;
                        background: rgba(59, 130, 246, 0.15);
                        border: 1px solid rgba(59, 130, 246, 0.3);
                        border-radius: 9999px;
                        font-size: 0.8rem;
                        font-weight: 600;
                        color: #93c5fd;
                        margin-bottom: 1rem;
                    }
                    .pulse {
                        width: 8px;
                        height: 8px;
                        background-color: var(--accent-green);
                        border-radius: 50%;
                        box-shadow: 0 0 12px var(--accent-green);
                        animation: pulse 2s infinite;
                    }
                    @keyframes pulse {
                        0%, 100% { opacity: 1; transform: scale(1); }
                        50% { opacity: 0.4; transform: scale(0.9); }
                    }
                    h1 {
                        font-size: 2.3rem;
                        font-weight: 700;
                        letter-spacing: -0.025em;
                        margin-bottom: 0.5rem;
                        background: linear-gradient(135deg, #ffffff 40%, #94a3b8 100%);
                        -webkit-background-clip: text;
                        -webkit-text-fill-color: transparent;
                    }
                    .subtitle {
                        color: var(--text-secondary);
                        font-size: 1.05rem;
                    }
                    .grid {
                        display: grid;
                        grid-template-columns: repeat(auto-fit, minmax(310px, 1fr));
                        gap: 1.25rem;
                        margin-bottom: 2.5rem;
                    }
                    .card {
                        background: var(--bg-card);
                        backdrop-filter: blur(12px);
                        border: 1px solid var(--border-color);
                        border-radius: 14px;
                        padding: 1.25rem 1.5rem;
                        transition: transform 0.2s ease, border-color 0.2s ease;
                    }
                    .card:hover {
                        transform: translateY(-2px);
                        border-color: rgba(59, 130, 246, 0.3);
                    }
                    .card-header {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        margin-bottom: 0.75rem;
                    }
                    .card-title {
                        font-weight: 600;
                        font-size: 1.05rem;
                        display: flex;
                        align-items: center;
                        gap: 0.5rem;
                    }
                    .port {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.75rem;
                        padding: 0.2rem 0.5rem;
                        background: rgba(255, 255, 255, 0.07);
                        border-radius: 6px;
                        color: var(--accent-cyan);
                    }
                    .desc {
                        font-size: 0.88rem;
                        color: var(--text-secondary);
                        margin-bottom: 1rem;
                    }
                    .route-badge {
                        font-family: 'JetBrains Mono', monospace;
                        font-size: 0.8rem;
                        background: rgba(0, 0, 0, 0.3);
                        padding: 0.4rem 0.6rem;
                        border-radius: 6px;
                        border-left: 3px solid var(--accent-blue);
                        color: #cbd5e1;
                        word-break: break-all;
                    }
                    .btn-link {
                        display: inline-block;
                        margin-top: 0.75rem;
                        color: var(--accent-blue);
                        text-decoration: none;
                        font-size: 0.85rem;
                        font-weight: 500;
                    }
                    .btn-link:hover {
                        text-decoration: underline;
                    }
                    .info-box {
                        background: rgba(17, 24, 39, 0.8);
                        border: 1px solid var(--border-color);
                        border-radius: 14px;
                        padding: 1.5rem;
                    }
                    .info-box h2 {
                        font-size: 1.15rem;
                        margin-bottom: 0.75rem;
                    }
                    .info-box p {
                        font-size: 0.9rem;
                        color: var(--text-secondary);
                        margin-bottom: 1rem;
                    }
                    .endpoints-table {
                        width: 100%;
                        border-collapse: collapse;
                        font-size: 0.85rem;
                    }
                    .endpoints-table th {
                        text-align: left;
                        padding: 0.6rem;
                        color: var(--text-secondary);
                        border-bottom: 1px solid var(--border-color);
                    }
                    .endpoints-table td {
                        padding: 0.6rem;
                        border-bottom: 1px solid rgba(255, 255, 255, 0.04);
                    }
                    .method {
                        font-family: 'JetBrains Mono', monospace;
                        font-weight: 600;
                        padding: 0.15rem 0.4rem;
                        border-radius: 4px;
                        font-size: 0.75rem;
                    }
                    .get { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; }
                    .post { background: rgba(59, 130, 246, 0.2); color: #93c5fd; }
                    .put { background: rgba(245, 158, 11, 0.2); color: #fcd34d; }
                    .delete { background: rgba(239, 68, 68, 0.2); color: #fca5a5; }
                    footer {
                        text-align: center;
                        margin-top: 3rem;
                        font-size: 0.85rem;
                        color: var(--text-secondary);
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <header>
                        <div class="badge">
                            <span class="pulse"></span>
                            API Gateway Active & Routing
                        </div>
                        <h1>Bibliotech Circulation Platform</h1>
                        <p class="subtitle">Enterprise Academic Resource & Circulation Management Platform</p>
                    </header>

                    <div class="grid">
                        <div class="card">
                            <div class="card-header">
                                <span class="card-title">📚 Book Service</span>
                                <span class="port">:8083</span>
                            </div>
                            <p class="desc">Catalog & inventory tracking with atomic borrowing and return verification.</p>
                            <div class="route-badge">GET /books</div>
                            <a href="/books" class="btn-link">Browse Catalog JSON &rarr;</a>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <span class="card-title">🔄 Loan Service</span>
                                <span class="port">:8084</span>
                            </div>
                            <p class="desc">Active circulation, duplicate borrow prevention, and full return lifecycle.</p>
                            <div class="route-badge">GET /loans/overdue</div>
                            <a href="/loans/overdue" class="btn-link">View Overdue Loans (Auth) &rarr;</a>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <span class="card-title">💰 Fine Service</span>
                                <span class="port">:8085</span>
                            </div>
                            <p class="desc">Overdue fine calculation ($5.00/day after 14-day loan) & payment processing.</p>
                            <div class="route-badge">POST /fines/calculate</div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <span class="card-title">🔐 Auth Service</span>
                                <span class="port">:8081</span>
                            </div>
                            <p class="desc">User authentication, password hashing, and HMAC-SHA256 JWT generation.</p>
                            <div class="route-badge">POST /auth/login</div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <span class="card-title">👤 User Service</span>
                                <span class="port">:8082</span>
                            </div>
                            <p class="desc">User profile management with role-based access for students and librarians.</p>
                            <div class="route-badge">GET /users</div>
                        </div>

                        <div class="card">
                            <div class="card-header">
                                <span class="card-title">🧭 Eureka Registry</span>
                                <span class="port">:8761</span>
                            </div>
                            <p class="desc">Service discovery host tracking all 7 microservices dynamically.</p>
                            <div class="route-badge">http://localhost:8761</div>
                            <a href="http://localhost:8761" target="_blank" class="btn-link">Open Eureka Dashboard &rarr;</a>
                        </div>
                    </div>

                    <div class="info-box">
                        <h2>Quick API Reference (Via Gateway: <code>http://localhost:8080</code>)</h2>
                        <p>All client and Postman requests should target port <code>8080</code>. The Gateway automatically routes and load-balances across registered instances.</p>
                        
                        <table class="endpoints-table">
                            <thead>
                                <tr>
                                    <th>Method</th>
                                    <th>Gateway Route</th>
                                    <th>Access / Role</th>
                                    <th>Description</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td><span class="method post">POST</span></td>
                                    <td><code>/auth/register</code></td>
                                    <td>Public</td>
                                    <td>Register student or librarian account</td>
                                </tr>
                                <tr>
                                    <td><span class="method post">POST</span></td>
                                    <td><code>/auth/login</code></td>
                                    <td>Public</td>
                                    <td>Login to obtain Bearer JWT token</td>
                                </tr>
                                <tr>
                                    <td><span class="method get">GET</span></td>
                                    <td><code>/books</code></td>
                                    <td>Public</td>
                                    <td>View all available books in library</td>
                                </tr>
                                <tr>
                                    <td><span class="method post">POST</span></td>
                                    <td><code>/books</code></td>
                                    <td>LIBRARIAN</td>
                                    <td>Add new book to library inventory</td>
                                </tr>
                                <tr>
                                    <td><span class="method post">POST</span></td>
                                    <td><code>/loans</code></td>
                                    <td>STUDENT / LIBRARIAN</td>
                                    <td>Borrow a book (prevents duplicate active loans)</td>
                                </tr>
                                <tr>
                                    <td><span class="method put">PUT</span></td>
                                    <td><code>/loans/{id}/return</code></td>
                                    <td>STUDENT / LIBRARIAN</td>
                                    <td>Return book (Loan &rarr; Fine &rarr; Book flow)</td>
                                </tr>
                                <tr>
                                    <td><span class="method get">GET</span></td>
                                    <td><code>/loans/overdue</code></td>
                                    <td>LIBRARIAN</td>
                                    <td>View all overdue active loans</td>
                                </tr>
                                <tr>
                                    <td><span class="method put">PUT</span></td>
                                    <td><code>/fines/{id}/pay</code></td>
                                    <td>LIBRARIAN</td>
                                    <td>Mark calculated fine as paid</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <footer>
                        Bibliotech Circulation Systems &bull; Enterprise Academic Resource Platform &bull; Project by Dhanya & Team
                    </footer>
                </div>
            </body>
            </html>
            """;
        return Mono.just(html);
    }
}
