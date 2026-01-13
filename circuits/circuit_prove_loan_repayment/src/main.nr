use poseidon::poseidon2;
mod merkle_tree;

fn main(
    // -------------------------
    // Public inputs (on-chain)
    // -------------------------
    root_deposit: pub Field,
    root_loan: pub Field,
    root_repay: pub Field,
    withdraw_amount: pub u128,
    recipient: pub Field,

    // -------------------------
    // Private inputs (witness)
    // -------------------------
    // Deposit secrets
    nullifier_d: Field,
    secret_d: Field,
    token_id: Field,
    amount: Field,

    // Merkle proofs
    merkle_proof_deposit: [Field; 16],
    is_even_deposit: [bool; 16],

    merkle_proof_loan: [Field; 16],
    is_even_loan: [bool; 16],

    merkle_proof_repay: [Field; 16],
    is_even_repay: [bool; 16],
) {

    // ----------------------------------
    // 1. Deposit commitment & membership
    // ----------------------------------
    let deposit_commitment: Field =
        poseidon2::Poseidon2::hash(
            [nullifier_d, secret_d, amount, token_id],
            4
        );

    let computed_deposit_root =
        merkle_tree::compute_merkle_root(
            deposit_commitment,
            merkle_proof_deposit,
            is_even_deposit
        );

    assert(computed_deposit_root == root_deposit);

    // ----------------------------------
    // 2. Loan commitment (DERIVED)
    // ----------------------------------
    let loan_commitment: Field =
        poseidon2::Poseidon2::hash([deposit_commitment], 1);

    let computed_loan_root =
        merkle_tree::compute_merkle_root(
            loan_commitment,
            merkle_proof_loan,
            is_even_loan
        );

    assert(computed_loan_root == root_loan);

    // ----------------------------------
    // 3. Repayment commitment (DERIVED)
    // ----------------------------------
    let repay_commitment: Field =
        poseidon2::Poseidon2::hash([loan_commitment], 1);

    let computed_repay_root =
        merkle_tree::compute_merkle_root(
            repay_commitment,
            merkle_proof_repay,
            is_even_repay
        );

    assert(computed_repay_root == root_repay);

    // ----------------------------------
    // 4. Withdrawal amount binding
    // ----------------------------------
    assert(amount == withdraw_amount as Field);

    // ----------------------------------
    // 5. Recipient binding (no-op but
    
    //    prevents optimizer removal)
    // ----------------------------------
    assert(recipient * recipient == recipient * recipient);
}