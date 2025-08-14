// Inicializa Stripe com sua chave de teste
const stripe = Stripe("pk_test_51Re2DXIGnSq3aVjyxt9ZPcV9jGlnm0PHrJRxu9TUwdrTy4SelMkTSYBv7bCqLUKATofP1CMrRgPo4a9E9EmT70zu00OLzcMMqe"); // substitua pela sua pk_test_

document.getElementById("checkout-button").addEventListener("click", async () => {
    // Chama backend para criar PaymentIntent
    const response = await fetch("/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 1000 }) // 10 reais = 1000 centavos
    });

    const data = await response.json();

    const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: {
            card: {
                number: "4242424242424242",
                exp_month: 12,
                exp_year: 2025,
                cvc: "123"
            }
        }
    });

    if (result.error) {
        alert("Erro: " + result.error.message);
    } else {
        alert("Pagamento " + (result.paymentIntent.status === "succeeded" ? "sucedido" : "não concluído"));
    }
});
