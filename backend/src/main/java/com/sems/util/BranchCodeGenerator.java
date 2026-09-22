package com.sems.util;

import com.sems.repository.BranchRepository;
import org.springframework.stereotype.Component;

import java.util.HashMap;
import java.util.Map;

@Component
public class BranchCodeGenerator {

    private final BranchRepository branchRepository;

    private static final Map<String, String> CITY_CODES = new HashMap<>();

    static {
        CITY_CODES.put("CHENNAI", "CHN");
        CITY_CODES.put("COIMBATORE", "CBE");
        CITY_CODES.put("ERODE", "ERD");
        CITY_CODES.put("SALEM", "SLM");
        CITY_CODES.put("MADURAI", "MDU");
        CITY_CODES.put("TRICHY", "TRY");
        CITY_CODES.put("TIRUCHIRAPPALLI", "TRY");
        CITY_CODES.put("BENGALURU", "BLR");
        CITY_CODES.put("BANGALORE", "BLR");
        CITY_CODES.put("HYDERABAD", "HYD");
        CITY_CODES.put("MUMBAI", "BOM");
        CITY_CODES.put("DELHI", "DEL");
        CITY_CODES.put("KOLKATA", "CCU");
        CITY_CODES.put("PUNE", "PUN");
        CITY_CODES.put("AHMEDABAD", "AMD");
        CITY_CODES.put("KOCHI", "COK");
    }

    public BranchCodeGenerator(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    public String generateBranchCode(String city, String branchName) {
        String cityPrefix = getCityCode(city, branchName);
        int sequence = 1;

        while (true) {
            String candidateCode = String.format("SEMS-%s-%03d", cityPrefix, sequence);
            if (!branchRepository.existsByBranchCode(candidateCode)) {
                return candidateCode;
            }
            sequence++;
        }
    }

    private String getCityCode(String city, String branchName) {
        if (city != null && !city.trim().isEmpty()) {
            String normalizedCity = city.trim().toUpperCase();
            if (CITY_CODES.containsKey(normalizedCity)) {
                return CITY_CODES.get(normalizedCity);
            }
            // Filter non-alphabet characters
            String clean = normalizedCity.replaceAll("[^A-Z]", "");
            if (clean.length() >= 3) {
                return clean.substring(0, 3);
            } else if (clean.length() > 0) {
                return String.format("%-3s", clean).replace(' ', 'X');
            }
        }

        if (branchName != null && !branchName.trim().isEmpty()) {
            String clean = branchName.trim().toUpperCase().replaceAll("[^A-Z]", "");
            if (clean.length() >= 3) {
                return clean.substring(0, 3);
            }
        }

        return "BRN";
    }
}
