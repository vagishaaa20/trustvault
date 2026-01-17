// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EvidenceChain {

    struct Evidence {
        string caseId;
        string evidenceId;
        string hash;        // SHA-256 hash of video
        uint256 timestamp;  // block timestamp when added
        bool exists;        // to prevent overwrite
    }

    // evidenceId => Evidence
    mapping(string => Evidence) private evidenceRecords;

    // ============ IMMUTABLE EVENT LOG ============
    event UploadEvent(
        address sender,
        bytes32 evidenceId,
        string hash,
        uint256 timestamp
    );

    event ViewEvent(
        address sender,
        bytes32 evidenceId,
        string hash,
        uint256 timestamp
    );

    event TransferEvent(
        address sender,
        address recipient,
        bytes32 evidenceId,
        string hash,
        uint256 timestamp
    );

    event ExportEvent(
        address sender,
        bytes32 evidenceId,
        string hash,
        string exportFormat,
        uint256 timestamp
    );

    // Legacy event for backward compatibility
    event EvidenceAdded(
        string indexed evidenceId,
        string caseId,
        string hash,
        uint256 timestamp
    );

    // ============ UPLOAD EVIDENCE ================
    function addEvidence(
        string memory _caseId,
        string memory _evidenceId,
        string memory _hash
    ) public {
        // Prevent overwriting existing evidence
        require(
            !evidenceRecords[_evidenceId].exists,
            "Evidence already exists"
        );

        evidenceRecords[_evidenceId] = Evidence(
            _caseId,
            _evidenceId,
            _hash,
            block.timestamp,
            true
        );

        // Emit immutable upload event log (hash evidenceId for indexing)
        emit UploadEvent(msg.sender, keccak256(abi.encodePacked(_evidenceId)), _hash, block.timestamp);
        emit EvidenceAdded(_evidenceId, _caseId, _hash, block.timestamp);
    }

    // ============ VERIFY HASH (VIEW ACTION) ================
    function getEvidenceHash(
        string memory _evidenceId
    ) public returns (string memory) {
        require(
            evidenceRecords[_evidenceId].exists,
            "Evidence not found"
        );
        
        string memory hash = evidenceRecords[_evidenceId].hash;
        
        // Emit immutable view event log (hash evidenceId for indexing)
        emit ViewEvent(msg.sender, keccak256(abi.encodePacked(_evidenceId)), hash, block.timestamp);
        
        return hash;
    }

    // ============ GET FULL EVIDENCE DETAILS ================
    function getEvidence(
        string memory _evidenceId
    )
        public
        returns (
            string memory caseId,
            string memory evidenceId,
            string memory hash,
            uint256 timestamp
        )
    {
        require(
            evidenceRecords[_evidenceId].exists,
            "Evidence not found"
        );

        Evidence memory e = evidenceRecords[_evidenceId];
        
        // Emit immutable view event log (hash evidenceId for indexing)
        emit ViewEvent(msg.sender, keccak256(abi.encodePacked(_evidenceId)), e.hash, block.timestamp);
        
        return (e.caseId, e.evidenceId, e.hash, e.timestamp);
    }

    // ============ TRANSFER EVIDENCE ================
    function transferEvidence(
        string memory _evidenceId,
        address _recipient
    ) public {
        require(
            evidenceRecords[_evidenceId].exists,
            "Evidence not found"
        );
        require(_recipient != address(0), "Invalid recipient address");

        string memory hash = evidenceRecords[_evidenceId].hash;
        
        // Emit immutable transfer event log (hash evidenceId for indexing)
        emit TransferEvent(
            msg.sender,
            _recipient,
            keccak256(abi.encodePacked(_evidenceId)),
            hash,
            block.timestamp
        );
    }

    // ============ EXPORT EVIDENCE ================
    function exportEvidence(
        string memory _evidenceId,
        string memory _exportFormat
    ) public returns (string memory) {
        require(
            evidenceRecords[_evidenceId].exists,
            "Evidence not found"
        );
        require(
            bytes(_exportFormat).length > 0,
            "Export format cannot be empty"
        );

        string memory hash = evidenceRecords[_evidenceId].hash;
        
        // Emit immutable export event log (hash evidenceId for indexing)
        emit ExportEvent(
            msg.sender,
            keccak256(abi.encodePacked(_evidenceId)),
            hash,
            _exportFormat,
            block.timestamp
        );
        
        return hash;
    }

    // ============ GET EVENT HISTORY ================
    // Note: Events are automatically indexed on the blockchain
    // Use web3.js or ethers.js to query these events by:
    // - sender address
    // - evidenceId
    // - timestamp range
}
