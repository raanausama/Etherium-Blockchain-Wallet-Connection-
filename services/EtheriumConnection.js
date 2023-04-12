const pool = require("../../db/pool");
const contractABI = require("../../contracts/abi.json");
const  ipfsClient =require("ipfs-http-client");
const ethers = require("ethers")
const { Web3 } = require("web3");
const { JsonRpcProvider } = require('@ethersproject/providers');
const HDWalletProvider = require('@truffle/hdwallet-provider');
const projectId = process.env.INFURA_PROJECT_ID;
const projectSecret = process.env.INFURA_PROJECT_SECRET_KEY;
const authorization = "Basic " + btoa(projectId + ":" + projectSecret);
const ipfs = ipfsClient.create({
    url: "https://ipfs.infura.io:5001/api/v0",
    headers: {
      authorization,
    },
  });
exports.generateAndStoreIPFS = async (app_version_id,countInt,director) => {
  // Generating ipfs hash
  try {
    const resp =
      await pool.query(`select application_version.*,payment.*, condition.*, attachment.*, attachment.name as file_name,attachment.type as doc_type, final.address as final_address, final.name as final_name, final.company_no as final_company_no, final.contact as final_contact, final.share as final_share,final.app_version_id as final_app_version_id, insurance.*,benificary.*,benificary.id as benificary_id, benificary.nric as benificary_nric, benificary.name as benificary_name,benificary.relation as benificary_relation, benificary.dob as benificary_dob, benificary.address as benificary_address, benificary.contact as benificary_contact, benificary.share as benificary_share, benificary.vesting_age as benificary_vesting_age, benificary.frequency as benificary_frequency, benificary.amount as benificary_amount, benificary.is_active as benificary_is_active,benificary.type as benificary_type, ROW_NUMBER() OVER (ORDER BY (SELECT NULL)) AS id,client.username,client.fullname as name,client.dob,client.nric_no as nric,client.race,client.nationality,client.address,client.cob,client.contact from client
         
        inner join application on client.username = application.client_username
        
        inner join insurance on application.app_id = insurance.app_id 
    
    inner join payment on client.username = payment.email
        
    inner join application_version on application.app_id = application_version.app_id 
    
    full join benificary on application_version.app_version_id = benificary.app_version_id	
    
    full join final on application_version.app_version_id = final.app_version_id	
    
    full join attachment on application_version.app_version_id = attachment.app_version_id	
    
    full join condition on application_version.app_version_id = condition.app_version_id	
        
    
    where application_version.app_version_id = ${app_version_id}`);

    // console.log("Approving request");
    // // console.log(resp.rows);
    let clientUserName="",userInfo = {},
      condition = {},
      applicationVersion = {},
      payment = {},
      insurance = {};
    let beneficiary = [],
      attachment = [],
      finalSubstitue = [];
    resp?.rows?.map((data) => {
      if (userInfo.clientEmail === undefined) {
        clientUserName=data.username;
        userInfo = {
          clientEmail: data.username,
          clientName: data.name,
          clientDOB: data.dob,
          clientNRIC: data.nric,
          clientRace: data.race,
          clientNationality: data.nationality,
          clientAddress: data.address,
          clientCOB: data.cob,
          clientContactNo: data.contact,
        };
      }
      if (condition.purpose_maintenance === undefined) {
        condition = {
          purpose_maintenance: data.purpose_maintenance,
          purpose_education: data.purpose_education,
          purpose_medical: data.purpose_medical,
          purpose_premium: data.purpose_premium,
          no_distribution_bankrupt: data.no_distribution_bankrupt,
          no_distribution_divorce: data.no_distribution_divorce,
          funds_fixed_deposit_low_risk: data.funds_fixed_deposit_low_risk,
          funds_balanced_portfolio: data.funds_balanced_portfolio,
          appointment_final_advisor: data.appointment_final_advisor,
          appointment_balanced_portfolio: data.appointment_balanced_portfolio,
          appointment_balanced_still_in_bussiness:
            data.appointment_balanced_still_in_bussiness,
          appointment_established_asset_manager:
            data.appointment_established_asset_manager,
          trust_duration_beneficiary_passes_name:
            data.trust_duration_beneficiary_passes_name,
          trust_hundered_years: data.trust_hundered_years,
          trust_duration_youngest_beneficiary_passes_name:
            data.trust_duration_youngest_beneficiary_passes_name,
          trust_duration_youngest_beneficiary_passes_age:
            data.trust_duration_youngest_beneficiary_passes_age,
          trust_duration_subject_above: data.trust_duration_subject_above,
          trust_duration_beneficiary_name: data.trust_duration_beneficiary_name,
          trust_duration_beneficiary_age: data.trust_duration_beneficiary_age,
        };
      }
      if (applicationVersion.director === undefined) {
        applicationVersion = {
          director: data.director,
          reviewer: data.reviewer,
        };
      }
      if (payment.email === undefined) {
        payment = {
          email: data.email,
          name: data.fullname,
          amount: data.amount,
          countIntry: data.countIntry,
          currency: data.currency,
        };
      }
      if (insurance.insurance_policy_no === undefined) {
        insurance = {
          insurance_policy_no: data.insurance_policy_no,
          insurance_plan: data.insurance_plan,
          insurance_carrier: data.insurance_carrier,
          sum_assured: data.sum_assured,
          name_of_life_insured: data.name_of_life_insured,
          owner_policy: data.owner_policy,
        };
      }
      if (
        attachment.length === 0 ||
        attachment.filter(
          (e) =>
            e.doc_name === data.doc_name &&
            e.document_type === data.document_type
        ).length === 0
      ) {
        attachment.push({
          file_name: data.file_name,
          doc_name: data.doc_name,
          document_type: data.document_type,
          type: data.doc_type,
        });
      }

      if (
        finalSubstitue.length === 0 ||
        finalSubstitue.filter(
          (e) =>
            e.share === data.final_share && e.contact === data.final_contact
        ).length === 0
      ) {
        finalSubstitue.push({
          name: data.final_name,
          address: data.final_address,
          contact: data.final_contact,
          share: data.final_share,
          company_no: data.final_company_no,
        });
      }
      // console.log('beneficairyh age',data.benificary_vesting_age)
      if (
        beneficiary.length === 0 ||
        beneficiary.filter((e) => e.nric === data.benificary_nric).length === 0
      ) {
        if (data.type === "adult") {
          // console.log('beneficairyh age',data.benificary_vesting_age)
          beneficiary.push({
            id: data.benificary_id,
            nric: data.benificary_nric,
            name: data.benificary_name,
            dob: data.benificary_dob,
            address: data.benificary_address,
            contact: data.benificary_contact,
            share: data.benificary_share,
            vesting_age: data.benificary_vesting_age,
            frequency: data.benificary_frequency,
            amount: data.benificary_amount,
            subBeneficiary: [],
          });
        } 
        else {
          beneficiary.sort((a, b) => {
            return a.id - b.id;
          });
          let position = parseInt(data.parentid);
          position--;
          if (
            position > 0 &&
            position <= beneficiary.length &&
            beneficiary[position] !== undefined &&
            beneficiary[position]['subBeneficiary'] !== undefined &&
            (beneficiary[position]['subBeneficiary'].length == 0 ||
              beneficiary[position]['subBeneficiary'].filter(
                (e) => e.nric === data.benificary_nric
              ).length === 0)
          ) {
            beneficiary[position]['subBeneficiary'].push({
              id: data.benificary_id,
              nric: data.benificary_nric,
              name: data.benificary_name,
              dob: data.benificary_dob,
              address: data.benificary_address,
              contact: data.benificary_contact,
              share: data.benificary_share,
              vesting_age: data.benificary_vesting_age,
              frequency: data.benificary_frequency,
              amount: data.benificary_amount,
              priority: data.priority,
            });
          }
        }
      }
    });
    let jsonForIPFS = {
      clientPersonalInfo: userInfo,
      attachments: attachment,
      insurance: insurance,
      conditions: condition,
      beneficiaries: beneficiary,
      finalSubstitue: finalSubstitue,
      paymentDetail: payment,
      documentReviewers: applicationVersion,
    };
    jsonForIPFS = JSON.stringify(jsonForIPFS);    

    const added = await ipfs.add(jsonForIPFS); 
    const url = `https://ipfs.io/ipfs/${added.path}`;
    console.info(/*added,*/ url); 
    
    // adding ipfs hash url to db 
    if (countInt === 0) {
    const ipfsHash = await pool.query(
        "INSERT INTO ipfshashes (ipfshash, client_username,director) VALUES($1,$2,$3) RETURNING *",
        [url,clientUserName,director]
    );

    } else {
      const ipfsHash = await pool.query(
        `update ipfshashes set ipfshash='${url}' where client_username='${clientUserName}'`
    );
    }


    
    // connecting block chain 

    const provider = new ethers.providers.JsonRpcProvider(process.env.Blockchain_url);
    const signer = provider.getSigner();
    const contract = new ethers.Contract(process.env.REACT_APP_ContractAddress, contractABI, provider);
    const daiWithSigner = contract.connect(signer);

    // console.log('clientUserName',clientUserName);

    const Hash = await pool.query(
      `SELECT cl.wallet_address, cl.wallet_private_key, ih.ipfshash
        FROM client cl
         JOIN ipfshashes ih ON cl.username = ih.client_username
         where client_username ='${clientUserName}'`
    );
    // console.log('hashdaata',Hash.rows[0])
    const ipfsfromdatabase = Hash.rows[0].ipfshash
    const wallet_address = Hash.rows[0].wallet_address
    // console.log('Hash',ipfsfromdatabase)
    const addressString = wallet_address;
    const address = await ethers.utils.getAddress(addressString);
    // console.log('address',address)
    if (countInt === 0) {
    tx = await daiWithSigner.setClient(address, ipfsfromdatabase.toString());
    tx.wait(1);
    } else {
    tx = await daiWithSigner.updateIPfs(address, ipfsfromdatabase.toString());
    tx.wait(1);
  }

    const transaction_id= await pool.query(
      `update ipfshashes set transaction_id='${tx.hash}' where client_username ='${clientUserName}'`
    );
    tx2 =await daiWithSigner.getClients(address);
    

    // console.log("end");
    return resp;
  } catch (ex) {
    // console.log("error", ex);
  }
};
