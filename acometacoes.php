<!-- acomodacoes.php -->
<?php
require_once "config/conexao.php";
?>
<!doctype html>
<html lang="pt-br">
<head>
  <meta charset="utf-8">
  <title>Acomodações - SulVagas</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <script src="https://cdn.tailwindcss.com"></script>
</head>
<body class="bg-gray-50 text-gray-800">
<header class="bg-white border-b">
  <div class="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
    <a href="/home.php" class="flex items-center gap-3">
      <img src="/assets/logoSulVagas.jpg" class="h-10 rounded" alt="SulVagas">
      <span class="font-bold text-xl">SulVagas</span>
    </a>
    <nav class="flex gap-3">
      <a href="buscar_imoveis.php" class="px-4 py-2 rounded-full border hover:bg-gray-100">Buscar Imóveis</a>
      <a href="anunciar_imovel.php" class="px-4 py-2 rounded-full border hover:bg-gray-100">Anunciar Imóveis</a>
    </nav>
  </div>
</header>

<main class="max-w-7xl mx-auto px-4 py-8">
  <div class="flex justify-center">
    <div class="w-full max-w-md bg-white rounded-2xl shadow-lg p-6">
      <div class="flex justify-center mb-6">
        <div class="inline-flex rounded-full bg-blue-100 px-4 py-2">
          <span class="text-sm font-medium text-blue-800">Acomodações</span>
        </div>
      </div>
      <div class="text-center mb-8">
        <h1 class="text-2xl font-bold">Alugue ou venda seu imóvel</h1>
        <p class="text-gray-600 mt-2">Encontre o lar perfeito ou compartilhe o seu.</p>
      </div>
      <div class="flex gap-3">
        <button onclick="window.location.href='buscar_imoveis.php'" class="flex-1 bg-blue-600 text-white rounded-full px-6 py-3 hover:bg-blue-700">Buscar Imóveis</button>
        <button onclick="window.location.href='anunciar_imovel.php'" class="flex-1 border rounded-full px-6 py-3 hover:bg-gray-50">Anunciar Imóveis</button>
      </div>
    </div>
  </div>
</main>
</body>
</html>