use poseidon::poseidon2;
mod merkle_tree;

fn main(
    root_repay: pub Field,
    nullifier_hash_repay: pub Field,
    nullifier_repay: Field,
    secret_repay: Field,
    merkle_proof_repay: [Field; 16],
    is_even_repay: [bool; 16],
    withdrawAmount: pub u128,

    
    root_deposit: pub Field,
    nullifier_hash_deposit: pub Field,
    borrow_amount: pub u128,
    asset_price: pub u128,
    minimum_collateralization_ratio: pub u128,
    tokenId: pub u64,
    recepient: pub Field,

    nullifier_deposit: Field,
    secret_deposit: Field,
    merkle_proof_deposit: [Field;16],
    is_even_deposit: [bool;16],
    amount: u128,
    actual_collateralization_ratio: u128,

    ) {
    // commitment to ensure that the loan is repaid
    let commitment: Field = poseidon2::Poseidon2::hash([nullifier_repay, secret_repay], 2);
    let computed_nullifier_hash: Field = poseidon2::Poseidon2::hash([nullifier_repay], 1);
    assert(computed_nullifier_hash == nullifier_hash_repay);
    let computed_root: Field = merkle_tree::compute_merkle_root(commitment, merkle_proof_repay, is_even_repay);
    assert(computed_root == root_repay);

    // commitment to ensure that the its tied to the user so he cannot fake withdrawals
    assert(actual_collateralization_ratio>=minimum_collateralization_ratio);
    let generated_commitment = poseidon2::Poseidon2::hash([nullifier_deposit,secret_deposit,amount as Field,tokenId as Field],4);
    let computed_nullifier_deposit_hash = poseidon2::Poseidon2::hash([nullifier_deposit, nullifier_deposit], 2);
    assert(nullifier_hash_deposit == computed_nullifier_deposit_hash);
    let computed_root = merkle_tree::compute_merkle_root(generated_commitment, merkle_proof_deposit, is_even_deposit);
    assert(root_deposit == computed_root);
    assert(amount==withdrawAmount);
    assert(amount*asset_price>=((borrow_amount*actual_collateralization_ratio)/100));
    assert(recepient*recepient==recepient*recepient);
}


